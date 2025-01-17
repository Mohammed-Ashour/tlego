package main

import (
	"fmt"
	"os"
	"time"

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
	tle := tles[0]
	fmt.Println(tle.Line1.Classification)
	tle.DrawOnMap(time.Now().UTC())

}
