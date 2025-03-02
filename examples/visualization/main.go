package main

import (
	"fmt"
	"math/rand"
	"os"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	visual "github.com/Mohammed-Ashour/tlego/pkg/visual"
)

func main() {

	// example
	satelliteGroup := os.Args[1]

	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		logger.Error("Can't get the Celestrak config", "Error", err)
		return
	}
	cTles, err := celestrak.GetSatelliteGroupTLEs(satelliteGroup, config)
	if err != nil {
		logger.Error("Can't get TLEs from Celestrak", "err", err)
	}
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

	htmlFileName := visual.CreateHTMLVisual(satData, satelliteGroup)
	logger.Info("Created an html with orbit visualization", "filename", htmlFileName)

}
