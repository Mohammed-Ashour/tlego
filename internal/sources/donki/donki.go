// Package donki reads recent space weather events from NASA CCMC DONKI. The data is research grade; NOAA SWPC is the official forecast source.
package donki

import (
	"bytes"
	"context"
	"encoding/json"
	"math"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "nasa-donki"

const (
	recentTTL  = 6 * time.Hour
	windowDays = 14
	maxEvents  = 8
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "NASA DONKI",
	Category: feed.CategorySpaceWeather,
	URL:      "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
	Credit:   "Space weather events from NASA CCMC DONKI (research grade)",
	Summary:  "Recent flares, coronal mass ejections and storms.",
	Nature:   feed.NatureObserved,
	Refresh:  "Every 6 hours while in use",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

// Event is a flare, coronal mass ejection or geomagnetic storm from DONKI.
type Event struct {
	Kind   string    `json:"kind"`
	Time   time.Time `json:"time"`
	Detail string    `json:"detail,omitempty"`
	URL    string    `json:"url,omitempty"`
}

// DONKI returns an empty body, rather than a list, when nothing happened.
func parse[T any](body []byte, read func(T) (Event, error)) ([]Event, error) {
	if len(bytes.TrimSpace(body)) == 0 {
		return []Event{}, nil
	}
	var rows []T
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, err
	}
	events := make([]Event, 0, len(rows))
	for _, row := range rows {
		event, err := read(row)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, nil
}

func eventTime(value string) (time.Time, error) { return feed.ParseUTC("2006-01-02T15:04Z", value) }

type flareRow struct {
	Begin string `json:"beginTime"`
	Class string `json:"classType"`
	Where string `json:"sourceLocation"`
	Link  string `json:"link"`
}

func readFlare(row flareRow) (Event, error) {
	at, err := eventTime(row.Begin)
	return Event{"Solar flare", at, strings.TrimSpace(row.Class + " " + row.Where), row.Link}, err
}

type massEjectionRow struct {
	Start string `json:"startTime"`
	Where string `json:"sourceLocation"`
	Link  string `json:"link"`
}

func readCME(row massEjectionRow) (Event, error) {
	at, err := eventTime(row.Start)
	return Event{"Coronal mass ejection", at, row.Where, row.Link}, err
}

type stormRow struct {
	Start string `json:"startTime"`
	Kp    []struct {
		Index float64 `json:"kpIndex"`
	} `json:"allKpIndex"`
	Link string `json:"link"`
}

func readStorm(row stormRow) (Event, error) {
	at, err := eventTime(row.Start)
	strongest := 0.0
	for _, sample := range row.Kp {
		strongest = math.Max(strongest, sample.Index)
	}
	detail := ""
	if strongest > 0 {
		detail = "Kp " + strconv.FormatFloat(strongest, 'f', -1, 64)
	}
	return Event{"Geomagnetic storm", at, detail, row.Link}, err
}

// Recent returns recent research-grade events. It succeeds if any type loads.
func (c *Client) Recent(ctx context.Context) ([]Event, feed.Meta, error) {
	end := c.feed.Now().UTC()
	window := url.Values{"startDate": {end.AddDate(0, 0, -windowDays).Format("2006-01-02")}, "endDate": {end.Format("2006-01-02")}}.Encode()
	product := func(kind string) feed.Request {
		return feed.Request{Source: ID, Key: strings.ToLower(kind), URL: c.base + "/" + kind + "?" + window, TTL: recentTTL}
	}
	var meta feed.Meta
	var failure error
	var loaded int
	events := []Event{}
	collect := func(part []Event, partMeta feed.Meta, err error) {
		if err != nil {
			// The first error is the real one; later ones only report the pause it caused.
			if failure == nil {
				failure = err
			}
			return
		}
		loaded++
		feed.Merge(&meta, partMeta)
		events = append(events, part...)
	}
	flares, part, err := feed.Get(ctx, c.feed, product("FLR"), func(b []byte) ([]Event, error) { return parse(b, readFlare) })
	collect(flares, part, err)
	mass, part, err := feed.Get(ctx, c.feed, product("CME"), func(b []byte) ([]Event, error) { return parse(b, readCME) })
	collect(mass, part, err)
	storms, part, err := feed.Get(ctx, c.feed, product("GST"), func(b []byte) ([]Event, error) { return parse(b, readStorm) })
	collect(storms, part, err)
	if loaded == 0 {
		return nil, feed.Meta{}, failure
	}
	if loaded < 3 && meta.Warning == "" {
		meta.Warning = "Some event types could not be read."
	}
	sort.SliceStable(events, func(i, j int) bool { return events[i].Time.After(events[j].Time) })
	return events[:min(len(events), maxEvents)], meta, nil
}
