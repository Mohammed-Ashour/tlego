package main

import (
	"fmt"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
)

func main() {
	satelliteGroup := "Starlink"
	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		logger.Error("Can't get the Celestrak config", "Error", err)
		return
	}
	tles, err := celestrak.GetSatelliteGroupTLEs(satelliteGroup, config)
	if err != nil {
		logger.Error("Can't get the TLEs for "+satelliteGroup, "Error", err)
		return
	}
	fmt.Println(tles)

	noradID := "25544"
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradID)
	if err != nil {
		logger.Error("Can't get the TLE for 25544", "Error", err)
		return
	}
	fmt.Println(tle)
}
