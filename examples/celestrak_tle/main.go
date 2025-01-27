package main

import (
	"fmt"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
)

func main() {
	satelliteGroup := "Starlink"
	tles, err := celestrak.GetSatelliteGroupTLEs(satelliteGroup)
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
