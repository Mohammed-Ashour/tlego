package sources

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
)

const (
	spaceWeatherTTL = 15 * time.Minute
	launchesTTL     = time.Hour
	satelliteTTL    = 30 * 24 * time.Hour
	radioTTL        = 24 * time.Hour

	alertWindow = 48 * time.Hour
	maxAlerts   = 5
	maxLaunches = 5
)

// decoded fetches a response and parses it. Parsing runs before anything is saved,
// so a malformed response can't replace good data.
func decoded[T any](ctx context.Context, c *Client, r request, parse func([]byte) (T, error)) (T, Meta, error) {
	r.validate = func(body []byte) error {
		_, err := parse(body)
		return err
	}
	var zero T
	body, meta, err := c.fetch(ctx, r)
	if err != nil {
		return zero, meta, err
	}
	value, err := parse(body)
	return value, meta, err
}

func parseUTC(layout, value string) (time.Time, error) {
	return time.ParseInLocation(layout, value, time.UTC)
}

// KpSample is one three-hour planetary K-index value.
type KpSample struct {
	Time time.Time `json:"time"`
	Kp   float64   `json:"kp"`
}

// FluxSample is one daily F10.7 solar radio flux value.
type FluxSample struct {
	Time time.Time `json:"time"`
	Flux float64   `json:"flux"`
}

// ScaleLevel is one current NOAA space weather scale.
type ScaleLevel struct {
	Level string `json:"level"`
	Text  string `json:"text"`
}

// Scales holds NOAA's radio blackout, solar radiation and geomagnetic storm scales.
type Scales struct {
	Radio       ScaleLevel `json:"radio"`
	Solar       ScaleLevel `json:"solar"`
	Geomagnetic ScaleLevel `json:"geomagnetic"`
}

// Alert is a recent NOAA space weather message.
type Alert struct {
	ID       string    `json:"id"`
	IssuedAt time.Time `json:"issued_at"`
	Headline string    `json:"headline"`
}

// SpaceWeather combines the current NOAA products. Kp is always present; the other
// parts are left empty, with a warning, if their product can't be read.
type SpaceWeather struct {
	Kp     []KpSample   `json:"kp"`
	Flux   []FluxSample `json:"flux"`
	Scales *Scales      `json:"scales"`
	Alerts []Alert      `json:"alerts"`
}

func parseKp(body []byte) ([]KpSample, error) {
	var rows []struct {
		Time string   `json:"time_tag"`
		Kp   *float64 `json:"Kp"`
	}
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, err
	}
	samples := make([]KpSample, 0, len(rows))
	for _, row := range rows {
		parsed, err := parseUTC("2006-01-02T15:04:05", row.Time)
		if err != nil {
			return nil, err
		}
		if row.Kp == nil {
			return nil, errors.New("Kp sample has no value")
		}
		samples = append(samples, KpSample{parsed, *row.Kp})
	}
	if len(samples) == 0 {
		return nil, errors.New("no Kp samples")
	}
	return samples, nil
}

func parseFlux(body []byte) ([]FluxSample, error) {
	var rows []struct {
		Time string   `json:"time_tag"`
		Flux *float64 `json:"flux"`
	}
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, err
	}
	samples := make([]FluxSample, 0, len(rows))
	for _, row := range rows {
		parsed, err := parseUTC("2006-01-02T15:04:05", row.Time)
		if err != nil {
			return nil, err
		}
		if row.Flux == nil {
			return nil, errors.New("flux sample has no value")
		}
		samples = append(samples, FluxSample{parsed, *row.Flux})
	}
	if len(samples) == 0 {
		return nil, errors.New("no flux samples")
	}
	return samples, nil
}

func parseScales(body []byte) (*Scales, error) {
	type level struct {
		Scale *string `json:"Scale"`
		Text  *string `json:"Text"`
	}
	var days map[string]struct{ R, S, G level }
	if err := json.Unmarshal(body, &days); err != nil {
		return nil, err
	}
	current, ok := days["0"]
	if !ok || current.R.Scale == nil || current.S.Scale == nil || current.G.Scale == nil {
		return nil, errors.New("no current scales")
	}
	read := func(l level) ScaleLevel {
		result := ScaleLevel{Level: *l.Scale}
		if l.Text != nil {
			result.Text = *l.Text
		}
		return result
	}
	return &Scales{Radio: read(current.R), Solar: read(current.S), Geomagnetic: read(current.G)}, nil
}

var alertHeadline = regexp.MustCompile(`^(?:[A-Z]+ )*(?:ALERT|WARNING|WATCH|SUMMARY|CANCEL[A-Z]*)[A-Z ]*:.+`)

func parseAlerts(body []byte) ([]Alert, error) {
	var rows []struct {
		ID      string `json:"product_id"`
		Issued  string `json:"issue_datetime"`
		Message string `json:"message"`
	}
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, err
	}
	alerts := make([]Alert, 0, len(rows))
	for _, row := range rows {
		issued, err := parseUTC("2006-01-02 15:04:05.000", row.Issued)
		if err != nil {
			return nil, err
		}
		headline := row.ID
		for _, line := range strings.FieldsFunc(row.Message, func(r rune) bool { return r == '\r' || r == '\n' }) {
			if line = strings.TrimSpace(line); alertHeadline.MatchString(line) {
				headline = line
				break
			}
		}
		alerts = append(alerts, Alert{row.ID, issued, headline})
	}
	return alerts, nil
}

func combine(total *Meta, part Meta) {
	if total.FetchedAt.IsZero() || part.FetchedAt.Before(total.FetchedAt) {
		total.FetchedAt = part.FetchedAt
	}
	total.Stale = total.Stale || part.Stale
	if total.Warning == "" {
		total.Warning = part.Warning
	}
}

func (c *Client) swpc(path string) request {
	return request{source: IDSWPC, key: strings.TrimSuffix(path[strings.LastIndex(path, "/")+1:], ".json"), url: c.endpoints.SWPC + path, ttl: spaceWeatherTTL}
}

// SpaceWeather returns current solar and geomagnetic conditions from NOAA.
func (c *Client) SpaceWeather(ctx context.Context) (SpaceWeather, Meta, error) {
	kp, meta, err := decoded(ctx, c, c.swpc("/products/noaa-planetary-k-index.json"), parseKp)
	if err != nil {
		return SpaceWeather{}, Meta{}, err
	}
	result := SpaceWeather{Kp: kp, Flux: []FluxSample{}, Alerts: []Alert{}}
	missing := func(err error) {
		if ctx.Err() == nil && err != nil && meta.Warning == "" {
			meta.Warning = "Some space weather products could not be read."
		}
	}
	flux, part, err := decoded(ctx, c, c.swpc("/products/10cm-flux-30-day.json"), parseFlux)
	missing(err)
	if err == nil {
		result.Flux = flux
		combine(&meta, part)
	}
	scales, part, err := decoded(ctx, c, c.swpc("/products/noaa-scales.json"), parseScales)
	missing(err)
	if err == nil {
		result.Scales = scales
		combine(&meta, part)
	}
	alerts, part, err := decoded(ctx, c, c.swpc("/products/alerts.json"), parseAlerts)
	missing(err)
	if err == nil {
		combine(&meta, part)
		result.Alerts = recentAlerts(alerts, c.now())
	}
	return result, meta, ctx.Err()
}

func recentAlerts(alerts []Alert, now time.Time) []Alert {
	recent := make([]Alert, 0, maxAlerts)
	for _, alert := range alerts {
		if now.Sub(alert.IssuedAt) <= alertWindow {
			recent = append(recent, alert)
		}
	}
	sort.SliceStable(recent, func(i, j int) bool { return recent[i].IssuedAt.After(recent[j].IssuedAt) })
	return recent[:min(len(recent), maxAlerts)]
}

// CatalogEntry is one Wikidata item carrying a NORAD catalog number.
type CatalogEntry struct {
	WikidataID  string   `json:"wikidata_id"`
	URL         string   `json:"url"`
	Name        string   `json:"name"`
	Description string   `json:"description,omitempty"`
	Types       []string `json:"types"`
	Operators   []string `json:"operators"`
	Countries   []string `json:"countries"`
	LaunchDate  string   `json:"launch_date,omitempty"`
}

var unlabeled = regexp.MustCompile(`^Q\d+$`)

func parseWikidata(body []byte) ([]CatalogEntry, error) {
	var document struct {
		Results *struct {
			Bindings []map[string]struct {
				Value string `json:"value"`
			} `json:"bindings"`
		} `json:"results"`
	}
	if err := json.Unmarshal(body, &document); err != nil {
		return nil, err
	}
	if document.Results == nil {
		return nil, errors.New("no results")
	}
	byID := map[string]*CatalogEntry{}
	add := func(list *[]string, value string) {
		if value == "" || unlabeled.MatchString(value) {
			return
		}
		for _, existing := range *list {
			if existing == value {
				return
			}
		}
		*list = append(*list, value)
		sort.Strings(*list)
	}
	for _, row := range document.Results.Bindings {
		address := row["item"].Value
		id := address[strings.LastIndex(address, "/")+1:]
		if id == "" {
			return nil, errors.New("result has no item")
		}
		entry := byID[id]
		if entry == nil {
			entry = &CatalogEntry{WikidataID: id, URL: "https://www.wikidata.org/wiki/" + id, Name: row["itemLabel"].Value, Description: row["itemDescription"].Value, Types: []string{}, Operators: []string{}, Countries: []string{}}
			byID[id] = entry
		}
		add(&entry.Types, row["typeLabel"].Value)
		add(&entry.Operators, row["operatorLabel"].Value)
		add(&entry.Countries, row["countryLabel"].Value)
		if launch := row["launch"].Value; len(launch) >= 10 && (entry.LaunchDate == "" || launch[:10] < entry.LaunchDate) {
			entry.LaunchDate = launch[:10]
		}
	}
	entries := make([]CatalogEntry, 0, len(byID))
	for _, entry := range byID {
		entries = append(entries, *entry)
	}
	// Lower Q numbers are older items, which puts the main item first.
	sort.Slice(entries, func(i, j int) bool {
		if len(entries[i].WikidataID) != len(entries[j].WikidataID) {
			return len(entries[i].WikidataID) < len(entries[j].WikidataID)
		}
		return entries[i].WikidataID < entries[j].WikidataID
	})
	return entries, nil
}

func canonicalID(id string) (string, error) {
	if err := catalog.ValidateNoradID(id); err != nil {
		return "", err
	}
	return strings.TrimLeft(id, "0"), nil
}

// SatelliteDetails returns the Wikidata items carrying a NORAD catalog number. Some
// numbers have several, such as a station and its first module.
func (c *Client) SatelliteDetails(ctx context.Context, noradID string) ([]CatalogEntry, Meta, error) {
	id, err := canonicalID(noradID)
	if err != nil {
		return nil, Meta{}, err
	}
	query := fmt.Sprintf(`SELECT ?item ?itemLabel ?itemDescription ?typeLabel ?operatorLabel ?countryLabel ?launch WHERE {
  ?item wdt:P377 "%s".
  OPTIONAL { ?item wdt:P31 ?type. }
  OPTIONAL { ?item wdt:P137 ?operator. }
  OPTIONAL { ?item wdt:P495 ?country. }
  OPTIONAL { ?item wdt:P619 ?launch. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 200`, id)
	return decoded(ctx, c, request{source: IDWikidata, key: id, url: c.endpoints.Wikidata + "?" + url.Values{"query": {query}}.Encode(), accept: "application/sparql-results+json", ttl: satelliteTTL}, parseWikidata)
}

// Transmitter is one radio entry from SatNOGS DB.
type Transmitter struct {
	Description string   `json:"description"`
	Type        string   `json:"type"`
	Mode        string   `json:"mode,omitempty"`
	Status      string   `json:"status"`
	Alive       bool     `json:"alive"`
	DownlinkHz  *float64 `json:"downlink_hz"`
	UplinkHz    *float64 `json:"uplink_hz"`
	Baud        *float64 `json:"baud"`
}

func parseTransmitters(body []byte) ([]Transmitter, error) {
	var rows []struct {
		Description string   `json:"description"`
		Type        string   `json:"type"`
		Mode        *string  `json:"mode"`
		Status      string   `json:"status"`
		Alive       bool     `json:"alive"`
		Downlink    *float64 `json:"downlink_low"`
		Uplink      *float64 `json:"uplink_low"`
		Baud        *float64 `json:"baud"`
	}
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, err
	}
	if rows == nil {
		return nil, errors.New("no transmitter list")
	}
	result := make([]Transmitter, 0, len(rows))
	for _, row := range rows {
		item := Transmitter{Description: row.Description, Type: row.Type, Status: row.Status, Alive: row.Alive, DownlinkHz: row.Downlink, UplinkHz: row.Uplink, Baud: row.Baud}
		if row.Mode != nil {
			item.Mode = *row.Mode
		}
		result = append(result, item)
	}
	return result, nil
}

// Transmitters returns the radio entries SatNOGS DB holds for a satellite.
func (c *Client) Transmitters(ctx context.Context, noradID string) ([]Transmitter, Meta, error) {
	id, err := canonicalID(noradID)
	if err != nil {
		return nil, Meta{}, err
	}
	address := c.endpoints.SatNOGS + "/transmitters/?" + url.Values{"satellite__norad_cat_id": {id}, "format": {"json"}}.Encode()
	return decoded(ctx, c, request{source: IDSatNOGS, key: id, url: address, ttl: radioTTL}, parseTransmitters)
}

// Launch is one upcoming launch.
type Launch struct {
	Name      string    `json:"name"`
	NoEarlier time.Time `json:"net"`
	Status    string    `json:"status"`
	Precision string    `json:"precision,omitempty"`
}

func parseLaunches(body []byte) ([]Launch, error) {
	var document struct {
		Results *[]struct {
			Name   string    `json:"name"`
			Net    time.Time `json:"net"`
			Status struct {
				Name   string `json:"name"`
				Abbrev string `json:"abbrev"`
			} `json:"status"`
			Precision *struct {
				Name string `json:"name"`
			} `json:"net_precision"`
		} `json:"results"`
	}
	if err := json.Unmarshal(body, &document); err != nil {
		return nil, err
	}
	if document.Results == nil {
		return nil, errors.New("no results")
	}
	launches := make([]Launch, 0, len(*document.Results))
	for _, row := range *document.Results {
		// The upcoming list keeps launches for a while after they fly.
		switch row.Status.Abbrev {
		case "Success", "Failure", "Partial Failure":
			continue
		}
		launch := Launch{Name: row.Name, NoEarlier: row.Net, Status: row.Status.Name}
		if row.Precision != nil {
			launch.Precision = row.Precision.Name
		}
		launches = append(launches, launch)
	}
	return launches, nil
}

// UpcomingLaunches returns the next scheduled launches.
func (c *Client) UpcomingLaunches(ctx context.Context) ([]Launch, Meta, error) {
	address := c.endpoints.LaunchLibrary + "/launches/upcoming/?" + url.Values{"limit": {"20"}, "mode": {"list"}}.Encode()
	launches, meta, err := decoded(ctx, c, request{source: IDLaunchLibrary, key: "upcoming", url: address, ttl: launchesTTL}, parseLaunches)
	if err != nil {
		return nil, meta, err
	}
	return launches[:min(len(launches), maxLaunches)], meta, nil
}
