package main

import (
	"os"

	viz "github.com/Mohammed-Ashour/tlego/pkg/locate"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	sat "github.com/Mohammed-Ashour/tlego/pkg/sgp4"
	tle "github.com/Mohammed-Ashour/tlego/pkg/tle"
	visual "github.com/Mohammed-Ashour/tlego/pkg/visual"
)

func main() {

	// example
	filePath := os.Args[1]
	tles, err := tle.ReadTLEFile(filePath)
	if err != nil {
		logger.Error("Failed to read TLE file", "error", err)
		return
	}
	t := tles[0]
	visual.DrawOrbit(t, 3600)
	logger.Info("Processing TLE",
		"classification", t.Line1.Classification,
		"satellite_id", t.Line1.SataliteID)
	s := sat.NewSatelliteFromTLE(t)

	// Use epoch time instead of current time
	epochTime := t.GetTLETime()

	lat, long, alt, err := viz.CalculatePositionLLA(s, epochTime)

	if err != nil {
		logger.Error("Failed to calculate position", "error", err)
		return
	}
	logger.Info("Satellite position calculated",
		"latitude", lat,
		"longitude", long,
		"altitude", alt)

	googleMapsURL, err := viz.GetGoogleMapsURL(t, s, epochTime)
	if err != nil {
		logger.Error("Error:", err)
		return
	}
	logger.Info("Google Maps:", "URL", googleMapsURL)

}
