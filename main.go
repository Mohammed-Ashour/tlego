package main

import (
	"fmt"
	"os"

	viz "github.com/Mohammed-Ashour/tlego/satviz"
	sat "github.com/Mohammed-Ashour/tlego/sgp4"
	tle "github.com/Mohammed-Ashour/tlego/tle"
)

func main() {

	// example
	filePath := os.Args[1]
	tles, err := tle.ReadTLEFile(filePath)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	t := tles[0]
	fmt.Println(t.Line1.Classification)
	s := sat.NewSatelliteFromTLE(t)

	// Use epoch time instead of current time
	epochTime := t.GetTLETime()

	lat, long, alt, err := viz.CalculatePositionLLA(s, epochTime)

	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Latitude:", lat)
	fmt.Println("Longitude:", long)
	fmt.Println("Altitude:", alt)

	googleMapsURL, err := viz.GetGoogleMapsURL(t, s, epochTime)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Google Maps URL:", googleMapsURL)

}
