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
## General Command Structure

```bash
tlego <command> [arguments] [flags]
```

### Commands

#### 1. Fetch TLE Data for a Satellite

```bash
tlego tle <NORAD-ID>
```

- **Description:** Fetches the Two-Line Element (TLE) data for a satellite identified by its NORAD ID.
- **Example:**
  ```bash
  tlego tle 25544
  ```

#### 2. Visualize Satellite Orbit

```bash
tlego viz <NORAD-ID>
```

- **Description:** Creates a 3D visualization of the satellite's orbit.
- **Example:**
  ```bash
  tlego viz 25544
  ```

#### 3. List Satellite Groups

```bash
tlego list --sat-group <satellite-group>
```

- **Description:** Lists all satellites in a specific satellite group.
- **Example:**
  ```bash
  tlego list --sat-group "Starlink"
  ```

#### 4. Predict Satellite Position

```bash
tlego predict <NORAD-ID> --time <timestamp>
```

- **Description:** Predicts where a satellite will be at a specific time.
- **Flags:**
  - `--time`: Specify the time in ISO 8601 format (e.g., `2024-02-26T12:00:00Z`).
- **Example:**
  ```bash
  tlego predict 25544 --time 2024-02-26T12:00:00Z
  ```

#### 5. Track Real-Time Satellite Position

```bash
tlego track <NORAD-ID>
```

- **Description:** Continuously tracks the real-time position of a satellite.
- **Example:**
  ```bash
  tlego track 25544
  ```

#### 6. Search for Satellites by Name

```bash
tlego search <keyword>
```

- **Description:** Searches for satellites by name or partial name match.
- **Example:**
  ```bash
  tlego search starlink
  ```

#### 7. Generate Satellite Report

```bash
tlego report <NORAD-ID>
```

- **Description:** Generates a detailed report for a satellite, including:
  - TLE data
  - Orbital parameters (e.g., inclination, eccentricity, mean motion)
  - Current position (latitude, longitude, altitude)
  - Google Maps URL for visualization
- **Example:**
  ```bash
  tlego report 25544
  ```

- **Sample Output:**

  ```plaintext
  Satellite Report
  ================
  Name: ISS (ZARYA)
  NORAD ID: 25544

  TLE Data:
  ---------
  ISS (ZARYA)
  1 25544U 98067A   24057.91666667  .00000000  00000+0  00000+0 0    04
  2 25544  51.6416 247.4627 0006946 130.5360 325.0288 15.49140836    00

  Orbital Parameters:
  --------------------
  Inclination: 51.641600° (degrees)
  Eccentricity: 0.000695
  Mean Motion: 15.491408 (revolutions per day)
  Altitude: 408.23 km

  Current Position (as of 2024-02-26T12:00:00Z):
  ----------------------------
  Latitude: 37.800000°
  Longitude: -122.400000°
  Altitude: 408.23 km

  Google Maps URL:
  ----------------
  https://www.google.com/maps/?q=37.800000,-122.400000
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
