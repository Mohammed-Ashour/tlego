// Package gcat reads Jonathan McDowell's General Catalog of Artificial Space Objects.
package gcat

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "gcat"

const tableTTL = 30 * 24 * time.Hour

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "GCAT",
	Category: feed.CategoryMissions,
	URL:      "https://planet4589.org/space/gcat/web/intro/index.html",
	Credit:   "Jonathan McDowell's General Catalog of Artificial Space Objects",
	Summary:  "Object kind, owner, manufacturer, bus and mass.",
	Nature:   feed.NatureReference,
	Refresh:  "Downloaded once, then kept for 30 days",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://planet4589.org/space/gcat/tsv/cat/satcat.tsv"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

// Record is a satellite's entry in Jonathan McDowell's catalog. Owner, State,
// Manufacturer, Status and OrbitClass hold GCAT's own codes.
type Record struct {
	Name         string   `json:"name"`
	Payload      string   `json:"payload_name,omitempty"`
	Kind         string   `json:"kind"`
	LaunchDate   string   `json:"launch_date,omitempty"`
	Status       string   `json:"status,omitempty"`
	Owner        string   `json:"owner,omitempty"`
	State        string   `json:"state,omitempty"`
	Manufacturer string   `json:"manufacturer,omitempty"`
	Bus          string   `json:"bus,omitempty"`
	MassKg       *float64 `json:"mass_kg"`
	OrbitClass   string   `json:"orbit_class,omitempty"`
}

var kinds = map[byte]string{'P': "Payload", 'R': "Rocket stage", 'C': "Component", 'D': "Debris", 'S': "Suborbital", 'X': "Deleted entry", 'Z': "Spurious entry"}

func validate(body []byte) error {
	if !bytes.HasPrefix(body, []byte("#JCAT\tSatcat\t")) {
		return errors.New("not a GCAT table")
	}
	return nil
}

func find(body []byte, id string) (*Record, error) {
	header, rest, ok := bytes.Cut(body, []byte("\n"))
	if !ok {
		return nil, errors.New("GCAT table has no rows")
	}
	columns := map[string]int{}
	for index, name := range strings.Split(strings.TrimPrefix(strings.TrimRight(string(header), "\r"), "#"), "\t") {
		columns[strings.TrimSpace(name)] = index
	}
	for _, required := range []string{"Satcat", "Type", "Name", "PLName", "LDate", "Status", "Owner", "State", "Manufacturer", "Bus", "Mass", "OpOrbit"} {
		if _, found := columns[required]; !found {
			return nil, fmt.Errorf("GCAT table has no %s column", required)
		}
	}
	for len(rest) > 0 {
		var line []byte
		line, rest, _ = bytes.Cut(rest, []byte("\n"))
		if len(line) == 0 || line[0] == '#' {
			continue
		}
		fields := strings.Split(strings.TrimRight(string(line), "\r"), "\t")
		value := func(name string) string {
			index := columns[name]
			if index >= len(fields) {
				return ""
			}
			cleaned := strings.TrimRight(strings.TrimSpace(fields[index]), "?")
			if cleaned == "-" {
				return ""
			}
			return strings.TrimSpace(cleaned)
		}
		if strings.TrimLeft(value("Satcat"), "0") != id {
			continue
		}
		record := &Record{Name: value("Name"), Payload: value("PLName"), LaunchDate: value("LDate"), Status: value("Status"), Owner: value("Owner"), State: value("State"), Manufacturer: value("Manufacturer"), Bus: value("Bus"), OrbitClass: value("OpOrbit")}
		if kind := value("Type"); kind != "" {
			record.Kind = kinds[kind[0]]
		}
		if mass, err := strconv.ParseFloat(value("Mass"), 64); err == nil && mass > 0 {
			record.MassKg = &mass
		}
		return record, nil
	}
	return nil, nil
}

// Lookup finds a satellite in the catalog, downloading it at most once a month.
// A nil record means the catalog has no entry for that number.
func (c *Client) Lookup(ctx context.Context, noradID string) (*Record, feed.Meta, error) {
	id, err := feed.CanonicalID(noradID)
	if err != nil {
		return nil, feed.Meta{}, err
	}
	body, meta, err := c.feed.Fetch(ctx, feed.Request{Source: ID, Key: "satcat", Ext: "tsv", URL: c.base, TTL: tableTTL, MaxBytes: 48 << 20, Timeout: 2 * time.Minute, Validate: validate})
	if err != nil {
		return nil, meta, err
	}
	record, err := find(body, id)
	return record, meta, err
}
