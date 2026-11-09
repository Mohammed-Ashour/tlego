// Package celestraksw reads observed daily space weather history from CelesTrak.
package celestraksw

import (
	"bytes"
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"math"
	"strconv"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "celestrak-space-weather"

const (
	historyTTL  = 6 * time.Hour
	historyDays = 365
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "CelesTrak space weather",
	Category: feed.CategorySpaceWeather,
	URL:      "https://celestrak.org/SpaceData/",
	Credit:   "Space weather history from CelesTrak",
	Summary:  "A year of daily Kp and F10.7, to compare with orbit changes.",
	Nature:   feed.NatureObserved,
	Refresh:  "Every 6 hours while in use",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://celestrak.org/SpaceData"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

// Day is one observed day of space weather.
type Day struct {
	Date  string  `json:"date"`
	KpMax float64 `json:"kp_max"`
	F107  float64 `json:"f107"`
}

func parseHistory(body []byte) ([]Day, error) {
	rows, err := csv.NewReader(bytes.NewReader(body)).ReadAll()
	if err != nil {
		return nil, err
	}
	if len(rows) < 2 {
		return nil, errors.New("no rows")
	}
	columns := map[string]int{}
	for index, name := range rows[0] {
		columns[name] = index
	}
	for _, required := range []string{"DATE", "KP1", "KP8", "F10.7_OBS", "F10.7_DATA_TYPE"} {
		if _, found := columns[required]; !found {
			return nil, fmt.Errorf("no %s column", required)
		}
	}
	days := make([]Day, 0, len(rows))
	for _, row := range rows[1:] {
		// Later rows are predictions, with no Kp values.
		if row[columns["F10.7_DATA_TYPE"]] != "OBS" || row[columns["KP8"]] == "" {
			continue
		}
		flux, err := strconv.ParseFloat(row[columns["F10.7_OBS"]], 64)
		if err != nil {
			return nil, err
		}
		strongest := 0.0
		for slot := columns["KP1"]; slot <= columns["KP8"]; slot++ {
			tenths, err := strconv.ParseFloat(row[slot], 64)
			if err != nil {
				return nil, err
			}
			strongest = math.Max(strongest, tenths/10)
		}
		days = append(days, Day{row[columns["DATE"]], strongest, flux})
	}
	if len(days) == 0 {
		return nil, errors.New("no observed days")
	}
	return days, nil
}

// Recent returns about a year of observed daily values.
func (c *Client) Recent(ctx context.Context) ([]Day, feed.Meta, error) {
	days, meta, err := feed.Get(ctx, c.feed, feed.Request{Source: ID, Key: "last-5-years", Ext: "csv", URL: c.base + "/SW-Last5Years.csv", TTL: historyTTL}, parseHistory)
	if err != nil {
		return nil, meta, err
	}
	return days[max(0, len(days)-historyDays):], meta, nil
}
