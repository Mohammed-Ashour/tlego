# TLEGO (Two Line Elements) [Still in progress]

A Go library for parsing and processing Two Line Elements (TLE) data and calculating satellite positions using the SGP4 propagation model.

## Overview

This library provides functionalities to:
- Parse TLE (Two Line Elements) data
- Calculate satellite positions using SGP4 propagation model
- Track satellite positions in semi real-time
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
    "github.com/Mohammed-Ashour/tlego/pkg/tle"
    "github.com/Mohammed-Ashour/tlego/pkg/sgp4"
    "github.com/Mohammed-Ashour/tlego/pkg/satviz"
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
    "os"
    
    "github.com/Mohammed-Ashour/tlego/pkg/logger"
    "github.com/Mohammed-Ashour/tlego/pkg/satviz"
    "github.com/Mohammed-Ashour/tlego/pkg/sgp4"
    "github.com/Mohammed-Ashour/tlego/pkg/tle"
)

func main() {
    filePath := os.Args[1]
    tles, err := tle.ReadTLEFile(filePath)
    if err != nil {
        logger.Error("Failed to read TLE file", "error", err)
        return
    }
    
    t := tles[0]
    logger.Info("Processing TLE", "classification", t.Line1.Classification)
    
    s := sgp4.NewSatelliteFromTLE(t)
    epochTime := t.GetTLETime()

    // Calculate LLA coordinates
    lat, long, alt, err := satviz.CalculatePositionLLA(s, epochTime)

    if err != nil {
        logger.Error("Failed to calculate position", "error", err)
        return
    }
    logger.Info("Calculated Position", "latitude", lat, "longitude", long, "altitude", alt)

    // Get Google Maps URL
    googleMapsURL, err := satviz.GetGoogleMapsURL(t, s, epochTime)
    if err != nil {
        logger.Error("Failed to get Google Maps URL", "error", err)
        return
    }
    logger.Info("Google Maps URL", "url", googleMapsURL)
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

