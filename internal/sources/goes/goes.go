// Package goes defines the GOES imagery layers, which are served through NASA GIBS.
package goes

import (
	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/gibs"
)

// ID identifies this source.
const ID = "noaa-goes"

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "NOAA GOES",
	Category: feed.CategoryEarthImagery,
	URL:      "https://www.goes.noaa.gov/",
	Credit:   "GOES imagery from NOAA, via NASA GIBS",
	Summary:  "Near-live views of the Americas and the Pacific.",
	Nature:   feed.NatureObserved,
	Refresh:  "Only when you choose a layer",
	Status:   feed.StatusLive,
}

// The two operational GOES views.
var (
	East = gibs.NewLayer("goes-east", "GOES East (near live)", Info, "GeoColor view of the Americas and Atlantic.", "GOES-East_ABI_GeoColor", true, false)
	West = gibs.NewLayer("goes-west", "GOES West (near live)", Info, "GeoColor view of the Pacific and western Americas.", "GOES-West_ABI_GeoColor", true, false)
)
