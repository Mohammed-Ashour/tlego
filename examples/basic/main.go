package main

import (
	"fmt"
	"math/rand"
	"os"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
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
	satelliteGroup := "Spire"
	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		logger.Error("Can't get the Celestrak config", "Error", err)
		return
	}
	cTles, err := celestrak.GetSatelliteGroupTLEs(satelliteGroup, config)
	satData := make([]visual.SatelliteData, len(cTles))
	for _, cTle := range cTles {
		points, err := visual.CreateOrbitPoints(cTle, 360)
		if err != nil {
			logger.Error("Failed to create orbit points", "err", err)
			continue
		}

		r := rand.Intn(256)
		g := rand.Intn(256)
		b := rand.Intn(256)

		satData = append(satData, visual.SatelliteData{
			Name:   cTle.Name,
			Points: points,
			Color:  fmt.Sprintf("#%02X%02X%02X", r, g, b),
		})

	}
	fmt.Println(len(cTles))

	t := tles[0]
	// points, err := visual.CreateOrbitPoints(t, 3600)
	// if err != nil {
	// 	logger.Error("Failed to create orbit points", "err", err)
	// 	return
	// }

	htmlFileName := visual.CreateHTMLVisual(satData)
	logger.Info("Created an html with orbit visualization", "filename", htmlFileName)
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
