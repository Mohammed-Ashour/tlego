// Package launchlibrary reads upcoming launches from The Space Devs Launch Library 2.
package launchlibrary

import (
	"context"
	"encoding/json"
	"errors"
	"net/url"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "launch-library"

const (
	upcomingTTL = time.Hour
	maxLaunches = 5
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "Launch Library 2",
	Category: feed.CategoryLaunches,
	URL:      "https://thespacedevs.com/llapi",
	Credit:   "Launch data from The Space Devs",
	Summary:  "Upcoming launches and their schedules.",
	Nature:   feed.NatureScheduled,
	Refresh:  "Every hour while in use",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://ll.thespacedevs.com/2.3.0"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

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

// Upcoming returns the next scheduled launches.
func (c *Client) Upcoming(ctx context.Context) ([]Launch, feed.Meta, error) {
	address := c.base + "/launches/upcoming/?" + url.Values{"limit": {"20"}, "mode": {"list"}}.Encode()
	launches, meta, err := feed.Get(ctx, c.feed, feed.Request{Source: ID, Key: "upcoming", URL: address, TTL: upcomingTTL}, parseLaunches)
	if err != nil {
		return nil, meta, err
	}
	return launches[:min(len(launches), maxLaunches)], meta, nil
}
