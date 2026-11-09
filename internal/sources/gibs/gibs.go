// Package gibs fetches worldwide images from NASA's Global Imagery Browse Services,
// which also carries the GOES and Himawari layers defined in their own packages.
package gibs

import (
	"bytes"
	"context"
	"errors"
	"net/url"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

// ID identifies this source.
const ID = "nasa-gibs"

const (
	dailyImageTTL = 6 * time.Hour
	liveImageTTL  = 30 * time.Minute
	maxImageBytes = 16 << 20
	minImageBytes = 100_000
)

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "NASA GIBS",
	Category: feed.CategoryEarthImagery,
	URL:      "https://nasa-gibs.github.io/gibs-api-docs/access-basics/",
	Credit:   "Imagery from NASA GIBS",
	Summary:  "Daily true-color Earth on the globe.",
	Nature:   feed.NatureObserved,
	Refresh:  "Only when you choose a layer",
	Status:   feed.StatusLive,
}

// DefaultBase is the provider's address.
const DefaultBase = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"

// Client reads this provider through a shared feed client.
type Client struct {
	feed *feed.Client
	base string
}

// New returns a client for the provider's default address.
func New(f *feed.Client) *Client { return NewAt(f, DefaultBase) }

// NewAt returns a client for another address, such as a test server.
func NewAt(f *feed.Client, base string) *Client { return &Client{f, base} }

// Layer is a global image that can be draped on the globe.
type Layer struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	SourceID    string `json:"source_id"`
	Credit      string `json:"credit"`
	Description string `json:"description"`
	Transparent bool   `json:"transparent"`

	GIBSName string `json:"-"`
	Daily    bool   `json:"-"`
	MinBytes int    `json:"-"`
}

// ContentType is the image format the provider returns for this layer.
func (l Layer) ContentType() string {
	if l.Transparent {
		return "image/png"
	}
	return "image/jpeg"
}

func validateImage(layer Layer) func([]byte) error {
	signature := []byte{0xFF, 0xD8, 0xFF}
	if layer.Transparent {
		signature = []byte{0x89, 'P', 'N', 'G'}
	}
	return func(body []byte) error {
		if !bytes.HasPrefix(body, signature) {
			return errors.New("not the expected image format")
		}
		if len(body) < layer.MinBytes {
			return errors.New("the image is empty")
		}
		return nil
	}
}

// Image returns one layer as a worldwide equirectangular image.
func (c *Client) Image(ctx context.Context, layer Layer) ([]byte, feed.Meta, error) {
	query := url.Values{"SERVICE": {"WMS"}, "REQUEST": {"GetMap"}, "VERSION": {"1.3.0"}, "STYLES": {""}, "CRS": {"EPSG:4326"}, "BBOX": {"-90,-180,90,180"}, "WIDTH": {"2048"}, "HEIGHT": {"1024"}, "LAYERS": {layer.GIBSName}, "FORMAT": {layer.ContentType()}}
	ttl, ext := liveImageTTL, "jpg"
	if layer.Transparent {
		query.Set("TRANSPARENT", "TRUE")
		ext = "png"
	}
	if layer.Daily {
		// A saved picture expires at the next UTC midnight, so yesterday's view is never
		// served after the day changes.
		now := c.feed.Now().UTC()
		midnight := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
		ttl = min(dailyImageTTL, now.Sub(midnight))
		query.Set("TIME", now.AddDate(0, 0, -1).Format("2006-01-02"))
	}
	return c.feed.Fetch(ctx, feed.Request{Source: ID, Key: layer.ID, Ext: ext, URL: c.base + "?" + query.Encode(), TTL: ttl, MaxBytes: maxImageBytes, Timeout: time.Minute, Validate: validateImage(layer)})
}

// NewLayer describes a GIBS layer for one source. Transparent layers are partial
// views of the Earth and come as PNG.
func NewLayer(id, name string, info feed.Info, description, gibsName string, transparent, daily bool) Layer {
	return Layer{ID: id, Name: name, SourceID: info.ID, Credit: info.Credit, Description: description, Transparent: transparent, GIBSName: gibsName, Daily: daily, MinBytes: minImageBytes}
}

// TrueColor is yesterday's worldwide view. It uses NOAA-20 because Suomi NPP's
// layer has had long outages.
var TrueColor = NewLayer("true-color", "True color (daily)", Info, "Yesterday's whole-Earth view from NOAA-20's VIIRS instrument.", "VIIRS_NOAA20_CorrectedReflectance_TrueColor", false, true)
