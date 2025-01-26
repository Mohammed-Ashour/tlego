# TLEGO (Two Line Elements) [Still in progress]

A Go library for parsing and processing Two Line Elements (TLE) data and calculating satellite positions using the SGP4 propagation model.

## Overview

This library provides functionalities to:
- Parse TLE (Two Line Elements) data
- Calculate satellite positions using SGP4 propagation model
- Track satellite positions in real-time
- Convert coordinates between different reference frames
- Generate Google Maps and Open Street Maps URLs for the satellite location



## Installation

```bash
go get github.com/Mohammed-Ashour/tlego
```

## Usage

#### Reading TLE from file (Supporting multi TLEs)
```go
// Parse TLE file
tles, err := tle.ReadTLEFile(filepath)

// Get TLE epoch time
epochTime := tle.GetTLETime()

// TLE struct fields
type TLE struct {
    Name  string
    Line1 TLELine1
    Line2 TLELine2
}

```

#### Simple Usage
```go
package main

import (
    "fmt"
    "time"
    "github.com/Mohammed-Ashour/tlego/tle"
    "github.com/Mohammed-Ashour/tlego/sgp4"
    "github.com/Mohammed-Ashour/tlego/satviz"
)

func main() {
    // Read TLE file
    tles, _ := tle.ReadTLEFile("tle_sample.txt")
    
    // Create satellite
    satellite := sgp4.NewSatelliteFromTLE(tles[0])
    
    // Get position at epoch
    epochTime := tles[0].GetTLETime()
    lat, long, alt, _ := satviz.CalculatePositionLLA(satellite, epochTime)
    
    fmt.Printf("Position: %.6f, %.6f, %.6f\n", lat, long, alt)
}
```

#### Creating a simple program using the full package
```go
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

	// Calculate LLA coordinates
	lat, long, alt, err := viz.CalculatePositionLLA(s, epochTime)

	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Latitude:", lat)
	fmt.Println("Longitude:", long)
	fmt.Println("Altitude:", alt)

	// Get Google Maps URL
	googleMapsURL, err := viz.GetGoogleMapsURL(t, s, epochTime)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Google Maps URL:", googleMapsURL)

}

```
## Features

- Full SGP4 implementation in pure Go
- High precision satellite position calculation
- Support for multiple time formats
- Thread-safe operations
- Extensible coordinate system transformations
- Satellite Position on GoogleMaps and OpenStreetMaps

## Dependencies
- Go 1.22 or later
- No external dependencies required

## Contributing
- Fork the repository
- Create your feature branch (git checkout -b feature/amazing-feature)
- Commit your changes (git commit -m 'Add amazing feature')
- Push to the branch (git push origin feature/amazing-feature)
- Open a Pull Request

## References & Credits

This project is a Go implementation of the SGP4 satellite propagation algorithm, adapted from the [Multi-Language SGP4 Implementation](https://github.com/aholinch/sgp4) by Aaron Holinch. The original repository provides implementations in multiple languages (Java, Python, C++), but did not include a Go version.

Key adaptations:
- Converted Java classes to Go structs
- Implemented Go-specific error handling
- Added Go-idiomatic features
- Maintained algorithm accuracy and precision

Please refer to the original repository for detailed algorithm documentation and mathematical background.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MIT License

Copyright (c) 2024 Mohammed Ashour

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

