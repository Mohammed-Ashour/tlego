// Package swpc reads current space weather from the NOAA Space Weather Prediction Center.
package swpc

import (
	"context"
	"encoding/json"
	"errors"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "noaa-swpc"

const (
	conditionsTTL = 15 * time.Minute
	alertWindow   = 48 * time.Hour
	maxAlerts     = 5
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "NOAA Space Weather Prediction Center",
	Category: feed.CategorySpaceWeather,
	URL:      "https://www.swpc.noaa.gov/",
	Credit:   "Space weather data from NOAA SWPC",
	Summary:  "Kp index, F10.7 solar flux, storm scales and alerts.",
	Nature:   feed.NatureObserved,
	Refresh:  "Every 15 minutes while in use",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://services.swpc.noaa.gov"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

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

// Conditions combines the current NOAA products. Kp is always present; the other
// parts are left empty, with a warning, if their product can't be read.
type Conditions struct {
	Kp     []KpSample   `json:"kp"`
	Flux   []FluxSample `json:"flux"`
	Scales *Scales      `json:"scales"`
	Alerts []Alert      `json:"alerts"`
}

// Conditions returns current solar and geomagnetic conditions from NOAA.
func (c *Client) Conditions(ctx context.Context) (Conditions, feed.Meta, error) {
	kp, meta, err := feed.Get(ctx, c.feed, c.product("/products/noaa-planetary-k-index.json"), parseKp)
	if err != nil {
		return Conditions{}, feed.Meta{}, err
	}
	result := Conditions{Kp: kp, Flux: []FluxSample{}, Alerts: []Alert{}}
	missing := func(err error) {
		if err != nil && meta.Warning == "" {
			meta.Warning = "Some space weather products could not be read."
		}
	}
	flux, part, err := feed.Get(ctx, c.feed, c.product("/products/10cm-flux-30-day.json"), parseFlux)
	missing(err)
	if err == nil {
		result.Flux = flux
		feed.Merge(&meta, part)
	}
	scales, part, err := feed.Get(ctx, c.feed, c.product("/products/noaa-scales.json"), parseScales)
	missing(err)
	if err == nil {
		result.Scales = scales
		feed.Merge(&meta, part)
	}
	alerts, part, err := feed.Get(ctx, c.feed, c.product("/products/alerts.json"), parseAlerts)
	missing(err)
	if err == nil {
		feed.Merge(&meta, part)
		result.Alerts = recentAlerts(alerts, c.feed.Now())
	}
	return result, meta, nil
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
		parsed, err := feed.ParseUTC("2006-01-02T15:04:05", row.Time)
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
		parsed, err := feed.ParseUTC("2006-01-02T15:04:05", row.Time)
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
		issued, err := feed.ParseUTC("2006-01-02 15:04:05.000", row.Issued)
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

func (c *Client) product(path string) feed.Request {
	return feed.Request{Source: ID, Key: strings.TrimSuffix(path[strings.LastIndex(path, "/")+1:], ".json"), URL: c.base + path, TTL: conditionsTTL}
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
