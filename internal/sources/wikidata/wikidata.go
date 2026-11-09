// Package wikidata reads satellite details from Wikidata by NORAD catalog number.
package wikidata

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

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "wikidata"

const entryTTL = 30 * 24 * time.Hour

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "Wikidata",
	Category: feed.CategoryMissions,
	URL:      "https://www.wikidata.org/wiki/Wikidata:Licensing",
	Credit:   "Satellite details from Wikidata (CC0)",
	Summary:  "Names, types, operators, countries and launch dates.",
	Nature:   feed.NatureReference,
	Refresh:  "When a satellite is opened, then kept for 30 days",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://query.wikidata.org/sparql"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

// Entry is one Wikidata item carrying a NORAD catalog number.
type Entry struct {
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

func parse(body []byte) ([]Entry, error) {
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
	byID := map[string]*Entry{}
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
			entry = &Entry{WikidataID: id, URL: "https://www.wikidata.org/wiki/" + id, Name: row["itemLabel"].Value, Description: row["itemDescription"].Value, Types: []string{}, Operators: []string{}, Countries: []string{}}
			byID[id] = entry
		}
		add(&entry.Types, row["typeLabel"].Value)
		add(&entry.Operators, row["operatorLabel"].Value)
		add(&entry.Countries, row["countryLabel"].Value)
		if launch := row["launch"].Value; len(launch) >= 10 && (entry.LaunchDate == "" || launch[:10] < entry.LaunchDate) {
			entry.LaunchDate = launch[:10]
		}
	}
	entries := make([]Entry, 0, len(byID))
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

// Lookup returns the Wikidata items carrying a NORAD catalog number. Some
// numbers have several, such as a station and its first module.
func (c *Client) Lookup(ctx context.Context, noradID string) ([]Entry, feed.Meta, error) {
	id, err := feed.CanonicalID(noradID)
	if err != nil {
		return nil, feed.Meta{}, err
	}
	query := fmt.Sprintf(`SELECT ?item ?itemLabel ?itemDescription ?typeLabel ?operatorLabel ?countryLabel ?launch WHERE {
  ?item wdt:P377 "%s".
  OPTIONAL { ?item wdt:P31 ?type. }
  OPTIONAL { ?item wdt:P137 ?operator. }
  OPTIONAL { ?item wdt:P495 ?country. }
  OPTIONAL { ?item wdt:P619 ?launch. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 200`, id)
	return feed.Get(ctx, c.feed, feed.Request{Source: ID, Key: id, URL: c.base + "?" + url.Values{"query": {query}}.Encode(), Accept: "application/sparql-results+json", TTL: entryTTL}, parse)
}
