// Package satnogs reads satellite transmitters from SatNOGS DB.
package satnogs

import (
	"context"
	"encoding/json"
	"errors"
	"net/url"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "satnogs"

const transmitterTTL = 24 * time.Hour

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "SatNOGS DB",
	Category: feed.CategoryRadio,
	URL:      "https://db.satnogs.org/about",
	Credit:   "Transmitter data from SatNOGS DB (CC BY-SA 4.0)",
	Summary:  "Transmitters, frequencies and modes.",
	Nature:   feed.NatureReference,
	Refresh:  "When a satellite is opened, then kept for a day",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://db.satnogs.org/api"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

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
func (c *Client) Transmitters(ctx context.Context, noradID string) ([]Transmitter, feed.Meta, error) {
	id, err := feed.CanonicalID(noradID)
	if err != nil {
		return nil, feed.Meta{}, err
	}
	address := c.base + "/transmitters/?" + url.Values{"satellite__norad_cat_id": {id}, "format": {"json"}}.Encode()
	return feed.Get(ctx, c.feed, feed.Request{Source: ID, Key: id, URL: address, TTL: transmitterTTL}, parseTransmitters)
}
