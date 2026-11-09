// Package sources ingests public data for display and describes where it comes
// from. Each user's own Khonsu fetches, caches and credits the data; none of it is
// bundled with the application or served to anyone else.
//
// Every provider is its own package under this directory and needs only a shared
// feed.Client, so any part of Khonsu can use one on its own. This package adds the
// list of sources by category and a Hub that holds them all.
package sources

import (
	"github.com/Mohammed-Ashour/khonsu/internal/sources/celestraksw"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/donki"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/earthsearch"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/gcat"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/gibs"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/goes"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/himawari"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/launchlibrary"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/openmeteo"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/satnogs"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/spacetrack"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/swpc"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/wikidata"
)

// Group is a category with its sources, in display order.
type Group struct {
	feed.Category
	Sources []feed.Info `json:"sources"`
}

// celesTrakGP is ingested by internal/catalog; it is listed here for credit.
var celesTrakGP = feed.Info{ID: "celestrak-gp", Name: "CelesTrak GP data", Category: feed.CategoryOrbits, URL: "https://celestrak.org/NORAD/documentation/gp-data-formats.php", Credit: "Orbital data from CelesTrak", Summary: "Orbital elements for positions and passes.", Nature: feed.NatureEstimated, Refresh: "Once per update, cached", Status: feed.StatusLive}

var categories = []feed.Category{
	{ID: feed.CategoryOrbits, Title: "Orbits and tracking", Description: "Where satellites are and where they will be."},
	{ID: feed.CategoryMissions, Title: "Missions and operators", Description: "What a satellite is, who runs it and when it launched."},
	{ID: feed.CategorySpaceWeather, Title: "Space weather", Description: "Solar activity that heats the upper atmosphere and changes low orbits."},
	{ID: feed.CategoryEarthImagery, Title: "Earth imagery", Description: "What satellites see of the planet."},
	{ID: feed.CategorySkyConditions, Title: "Sky conditions", Description: "Whether clouds will let you see a pass."},
	{ID: feed.CategoryRadio, Title: "Radio", Description: "What satellites transmit, and on which frequencies."},
	{ID: feed.CategoryLaunches, Title: "Launches", Description: "What is about to reach orbit."},
}

var all = []feed.Info{
	celesTrakGP, spacetrack.Info,
	wikidata.Info, gcat.Info,
	swpc.Info, celestraksw.Info, donki.Info,
	gibs.Info, goes.Info, himawari.Info, earthsearch.Info,
	openmeteo.Info,
	satnogs.Info,
	launchlibrary.Info,
}

// Layers lists the images that can be draped on the globe, in display order.
func Layers() []gibs.Layer {
	return []gibs.Layer{gibs.TrueColor, goes.East, goes.West, himawari.Infrared}
}

// FindLayer returns an imagery layer by ID.
func FindLayer(id string) (gibs.Layer, bool) {
	for _, layer := range Layers() {
		if layer.ID == id {
			return layer, true
		}
	}
	return gibs.Layer{}, false
}

// Catalog returns every source grouped by category. Callers own the result.
func Catalog() []Group {
	groups := make([]Group, 0, len(categories))
	for _, category := range categories {
		group := Group{Category: category, Sources: []feed.Info{}}
		for _, source := range all {
			if source.Category == category.ID {
				group.Sources = append(group.Sources, source)
			}
		}
		groups = append(groups, group)
	}
	return groups
}

// Lookup returns a source by ID.
func Lookup(id string) (feed.Info, bool) {
	for _, source := range all {
		if source.ID == id {
			return source, true
		}
	}
	return feed.Info{}, false
}

// Hub holds a client for every provider, all sharing one cache and one set of
// provider limits.
type Hub struct {
	SWPC          *swpc.Client
	SpaceHistory  *celestraksw.Client
	DONKI         *donki.Client
	Wikidata      *wikidata.Client
	GCAT          *gcat.Client
	SatNOGS       *satnogs.Client
	LaunchLibrary *launchlibrary.Client
	SpaceTrack    *spacetrack.Client
	GIBS          *gibs.Client
	EarthSearch   *earthsearch.Client
	OpenMeteo     *openmeteo.Client
}

// NewHub creates the provider clients. An empty cacheDir uses the user cache.
func NewHub(cacheDir string) *Hub {
	f := feed.NewClient(cacheDir)
	return &Hub{
		SWPC: swpc.New(f), SpaceHistory: celestraksw.New(f), DONKI: donki.New(f), Wikidata: wikidata.New(f), GCAT: gcat.New(f),
		SatNOGS: satnogs.New(f), LaunchLibrary: launchlibrary.New(f), SpaceTrack: spacetrack.New(f), GIBS: gibs.New(f), EarthSearch: earthsearch.New(f), OpenMeteo: openmeteo.New(f),
	}
}

// Catalog lists every source for this hub, including whether Space-Track is set up.
func (h *Hub) Catalog() []Group {
	groups := Catalog()
	if !h.SpaceTrack.Configured() {
		return groups
	}
	for _, group := range groups {
		for i := range group.Sources {
			if group.Sources[i].ID == spacetrack.ID {
				group.Sources[i].Status = feed.StatusLive
			}
		}
	}
	return groups
}
