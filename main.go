package main

import (
	"fmt"
	"os"
	"time"

	viz "go_tle/satviz"
	sat "go_tle/sgp4"
	tle "go_tle/tle"
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
	viz.DrawOnMap(t, s, time.Now())

}
