package main

import (
	"fmt"
	"os"
	"time"

	viz "tlego/satviz"
	sat "tlego/sgp4"
	tle "tlego/tle"
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
