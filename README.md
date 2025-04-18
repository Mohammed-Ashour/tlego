# TLEGO (Two Line Elements)

A Go library and CLI tool for parsing and processing Two Line Elements (TLE) data, calculating satellite positions using the SGP4 propagation model, and visualizing satellite orbits.

## Overview

This library and CLI tool provides functionalities to:
- Parse TLE (Two Line Elements) data
- Calculate satellite positions using the SGP4 propagation model
- Track satellite positions in semi real-time
- Convert coordinates between different reference frames
- Generate Google Maps and Open Street Maps URLs for the satellite location
- Fetch TLE for specific satellites or satellite groups from Celestrak
- Visualize satellite orbits in an HTML file

## Installation

```bash
go get github.com/Mohammed-Ashour/tlego
```

## CLI Usage

The `tlego` CLI tool provides several commands to interact with TLE data and visualize satellite orbits.
### Installation
```bash
go install github.com/Mohammed-Ashour/tlego
```
### **1. Fetch TLE for a Satellite**
Fetch the Two-Line Element (TLE) data for a satellite identified by its NORAD ID.

#### Command
```bash
tlego tle <NORAD-ID>
```

#### Example
```bash
tlego tle 25544
```

#### Output
```plaintext
ISS (ZARYA)
1 25544U 98067A   23274.54791667  .00016717  00000+0  10270-3 0  9993
2 25544  51.6442  83.5458 0008707  21.4567 338.6789 15.50000000 12345
```

---

### **2. Visualize Satellite Orbit**
Generate an HTML file visualizing the orbit of a satellite using its NORAD ID.

#### Command
```bash
tlego viz <NORAD-ID>
```

#### Example
```bash
tlego viz 25544
```

#### Output
```plaintext
Created an html with orbit visualization filename="25544_orbit.html"
```

The generated HTML file (`25544_orbit.html`) will contain a visualization of the satellite's orbit.

---

### **3. List Satellite Groups**
List all available satellite groups or fetch TLEs for a specific satellite group from Celestrak.

#### Command
```bash
tlego list --sat-group <satellite-group>
```

#### Example 1: List all available satellite groups
```bash
tlego list
```

#### Output
```plaintext
Groups supported:
    Starlink
    GPS
    Weather
    ISS
    Iridium
    ...
```

#### Example 2: Fetch TLEs for a specific satellite group
```bash
tlego list --sat-group Starlink
```

#### Output
```plaintext
STARLINK-1
1 44238U 19029A   23274.54791667  .00000000  00000+0  00000+0 0  9993
2 44238  53.0000  83.0000 0000000  21.0000 338.0000 15.00000000 12345

STARLINK-2
1 44239U 19029B   23274.54791667  .00000000  00000+0  00000+0 0  9993
2 44239  53.0000  83.0000 0000000  21.0000 338.0000 15.00000000 12345
...
```

---

## Library Usage

The `tlego` library can also be used programmatically in Go projects. Below are some examples of how to use the library.

### **1. Reading TLE from a File**
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

---

### **2. Simple Usage**
```go
package main

import (
    "fmt"
    "time"
    "github.com/Mohammed-Ashour/tlego/pkg/tle"
    "github.com/Mohammed-Ashour/tlego/pkg/sgp4"
    "github.com/Mohammed-Ashour/tlego/pkg/locate"
)

func main() {
    // Read TLE file
    tles, _ := tle.ReadTLEFile("tle_sample.txt")

    // Create satellite
    satellite := sgp4.NewSatelliteFromTLE(tles[0])

    // Get position at epoch
    epochTime := tles[0].GetTLETime()
    lat, long, alt, _ := locate.CalculatePositionLLA(satellite, epochTime)

    fmt.Printf("Position: %.6f, %.6f, %.6f\n", lat, long, alt)
}
```

---

### **3. Fetching TLEs from Celestrak**
```go
package main

import (
    "github.com/Mohammed-Ashour/tlego/pkg/celestrak"
    "github.com/Mohammed-Ashour/tlego/pkg/logger"
)

func main() {
    // Get TLEs for entire satellite group
    satelliteGroup := "Starlink"
	config, err := celestrak.ReadCelestrakConfig()
	if err != nil {
		logger.Error("Can't get the Celestrak config", "Error", err)
		return
	}
	tles, err := celestrak.GetSatelliteGroupTLEs(satelliteGroup, config)
    if err != nil {
        logger.Error("Failed to get Starlink TLEs", "error", err)
        return
    }

    // Get TLE for specific satellite by NORAD ID
    noradID := "25544" // ISS
    tle, err := celestrak.GetSatelliteTLEByNoradID(noradID)
    if err != nil {
        logger.Error("Failed to get ISS TLE", "error", err)
        return
    }
}
```

---

### **4. Create a Visualization of the Satellite Orbit**
```go
package main

import (
	"os"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
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
	points, err := visual.CreateOrbitPoints(t, 360)
	if err != nil {
		logger.Error("Failed to create orbit points", "err", err)
		return
	}

	htmlFileName := visual.CreateHTMLVisual(points, t.Name)
	logger.Info("Created an html with orbit visualization", "filename", htmlFileName)
}
```

---

## Features

- Full SGP4 implementation in pure Go
- High precision satellite position calculation
- Support for multiple time formats
- Thread-safe operations
- Extensible coordinate system transformations
- Satellite Position on GoogleMaps and OpenStreetMaps
- Create an HTML visualization of the Satellite orbit using the TLE
- CLI commands for fetching TLEs, listing satellite groups, and visualizing orbits

---

## Dependencies
- Go 1.22 or later
- gopkg.in/yaml.v3

---

## Contributing
- Fork the repository
- Create your feature branch (`git checkout -b feature/amazing-feature`)
- Commit your changes (`git commit -m 'Add amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

---

## References & Credits

This project is a Go implementation of the SGP4 satellite propagation algorithm, adapted from the [Multi-Language SGP4 Implementation](https://github.com/aholinch/sgp4) by Aaron Holinch. The original repository provides implementations in multiple languages (Java, Python, C++), but did not include a Go version.

Key adaptations:
- Converted Java classes to Go structs
- Implemented Go-specific error handling
- Added Go-idiomatic features
- Maintained algorithm accuracy and precision

Please refer to the original repository for detailed algorithm documentation and mathematical background.

---

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MIT License

Copyright (c) 2024 Mohammed Ashour

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
