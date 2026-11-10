// Package earthsearch finds the newest scenes captured by Sentinel-2 and Landsat satellites, using the Earth Search STAC catalog.
package earthsearch

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"sort"
	"strconv"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "earth-search"

const (
	scenesTTL = time.Hour
	maxScenes = 3
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "Earth Search STAC",
	Category: feed.CategoryEarthImagery,
	URL:      "https://element84.com/earth-search/",
	Credit:   "Scene search by Element 84 Earth Search",
	Summary:  "Latest scenes captured by Sentinel-2 and Landsat satellites.",
	Nature:   feed.NatureObserved,
	Refresh:  "When one of those satellites is opened, at most hourly",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://earth-search.aws.element84.com/v1"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

// Scene is one image a satellite captured.
type Scene struct {
	ID         string    `json:"id"`
	Time       time.Time `json:"time"`
	CloudCover *float64  `json:"cloud_cover"`
	CenterLat  float64   `json:"center_lat"`
	CenterLon  float64   `json:"center_lon"`
}

type sceneSource struct{ collection, platform string }

var imagingSatellites = map[string]sceneSource{
	"40697": {"sentinel-2-l2a", "sentinel-2a"},
	"42063": {"sentinel-2-l2a", "sentinel-2b"},
	"60989": {"sentinel-2-l2a", "sentinel-2c"},
	"39084": {"landsat-c2-l2", "landsat-8"},
	"49260": {"landsat-c2-l2", "landsat-9"},
}

// ImagingIDs returns the NORAD IDs of the satellites that have scenes, sorted. The
// IDs carry no leading zeros, the same form feed.CanonicalID gives.
func ImagingIDs() []string {
	ids := make([]string, 0, len(imagingSatellites))
	for id := range imagingSatellites {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	return ids
}

func parseScenes(body []byte) ([]Scene, error) {
	var document struct {
		Features *[]struct {
			ID         string    `json:"id"`
			BBox       []float64 `json:"bbox"`
			Properties struct {
				Time  time.Time `json:"datetime"`
				Cloud *float64  `json:"eo:cloud_cover"`
			} `json:"properties"`
		} `json:"features"`
	}
	if err := json.Unmarshal(body, &document); err != nil {
		return nil, err
	}
	if document.Features == nil {
		return nil, errors.New("no features")
	}
	scenes := make([]Scene, 0, len(*document.Features))
	for _, feature := range *document.Features {
		if len(feature.BBox) != 4 {
			return nil, errors.New("scene has no bounding box")
		}
		scenes = append(scenes, Scene{feature.ID, feature.Properties.Time, feature.Properties.Cloud, (feature.BBox[1] + feature.BBox[3]) / 2, (feature.BBox[0] + feature.BBox[2]) / 2})
	}
	return scenes, nil
}

// Recent returns the newest scenes a satellite captured. Only Sentinel-2 and
// Landsat are catalogued, and others return an empty list with no provider request.
func (c *Client) Recent(ctx context.Context, noradID string) ([]Scene, feed.Meta, error) {
	id, err := feed.CanonicalID(noradID)
	if err != nil {
		return nil, feed.Meta{}, err
	}
	imaging, known := imagingSatellites[id]
	if !known {
		return []Scene{}, feed.Meta{FetchedAt: c.feed.Now().UTC()}, nil
	}
	query := url.Values{"collections": {imaging.collection}, "limit": {strconv.Itoa(maxScenes)}, "sortby": {"-properties.datetime"}, "query": {fmt.Sprintf(`{"platform":{"eq":%q}}`, imaging.platform)}}
	return feed.Get(ctx, c.feed, feed.Request{Source: ID, Key: id, URL: c.base + "/search?" + query.Encode(), TTL: scenesTTL}, parseScenes)
}
