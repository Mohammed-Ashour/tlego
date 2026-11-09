// Package himawari defines the Himawari imagery layers, which are served through NASA GIBS.
package himawari

import (
	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/gibs"
)

// ID identifies this source.
const ID = "himawari"

// Info describes and credits this source.
var Info = feed.Info{
	ID:       ID,
	Name:     "Himawari",
	Category: feed.CategoryEarthImagery,
	URL:      "https://www.data.jma.go.jp/mscweb/en/himawari89/",
	Credit:   "Himawari imagery from JMA, via NASA GIBS",
	Summary:  "Near-live infrared views of Asia and the Pacific.",
	Nature:   feed.NatureObserved,
	Refresh:  "Only when you choose a layer",
	Status:   feed.StatusLive,
}

// Infrared shows clouds by day and by night.
var Infrared = gibs.NewLayer("himawari", "Himawari infrared (near live)", Info, "Infrared cloud view of Asia and the Pacific.", "Himawari_AHI_Band13_Clean_Infrared", true, false)
