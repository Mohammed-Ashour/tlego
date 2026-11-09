// Package openmeteo reads cloud cover forecasts from Open-Meteo.
package openmeteo

import (
	"context"
	"encoding/json"
	"errors"
	"math"
	"net/url"
	"strconv"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "open-meteo"

const (
	cloudTTL   = time.Hour
	cloudHours = 48
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "Open-Meteo",
	Category: feed.CategorySkyConditions,
	URL:      "https://open-meteo.com/en/terms",
	Credit:   "Weather data by Open-Meteo.com (CC BY 4.0)",
	Summary:  "Cloud cover near you, for deciding whether to go out for a pass.",
	Nature:   feed.NatureForecast,
	Refresh:  "Only when you ask, then kept for an hour",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://api.open-meteo.com/v1/forecast"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

// Hour is one hourly cloud cover forecast.
type Hour struct {
	Time    time.Time `json:"time"`
	Percent float64   `json:"percent"`
}

func parseClouds(body []byte) ([]Hour, error) {
	var document struct {
		Hourly *struct {
			Time  []string   `json:"time"`
			Cloud []*float64 `json:"cloud_cover"`
		} `json:"hourly"`
	}
	if err := json.Unmarshal(body, &document); err != nil {
		return nil, err
	}
	if document.Hourly == nil || len(document.Hourly.Time) == 0 || len(document.Hourly.Time) != len(document.Hourly.Cloud) {
		return nil, errors.New("no hourly forecast")
	}
	hours := make([]Hour, 0, len(document.Hourly.Time))
	for index, value := range document.Hourly.Time {
		at, err := feed.ParseUTC("2006-01-02T15:04", value)
		if err != nil {
			return nil, err
		}
		if cloud := document.Hourly.Cloud[index]; cloud != nil {
			hours = append(hours, Hour{at, *cloud})
		}
	}
	return hours, nil
}

// Clouds returns the next two days of cloud cover. Coordinates are rounded to
// about 10 km before they leave the machine, which is finer than a cloud forecast.
func (c *Client) Clouds(ctx context.Context, lat, lon float64) ([]Hour, feed.Meta, error) {
	rounded := func(value float64) string { return strconv.FormatFloat(math.Round(value*10)/10, 'f', 1, 64) }
	latitude, longitude := rounded(lat), rounded(lon)
	query := url.Values{"latitude": {latitude}, "longitude": {longitude}, "hourly": {"cloud_cover"}, "forecast_days": {"3"}, "timezone": {"UTC"}}
	hours, meta, err := feed.Get(ctx, c.feed, feed.Request{Source: ID, Key: latitude + "_" + longitude, URL: c.base + "?" + query.Encode(), TTL: cloudTTL}, parseClouds)
	if err != nil {
		return nil, meta, err
	}
	start := c.feed.Now().Truncate(time.Hour)
	upcoming := make([]Hour, 0, cloudHours)
	for _, hour := range hours {
		if !hour.Time.Before(start) && len(upcoming) < cloudHours {
			upcoming = append(upcoming, hour)
		}
	}
	return upcoming, meta, nil
}
