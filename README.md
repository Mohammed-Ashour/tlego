# TLEGO (Two Line Elements)

A Go CLI tool for interacting with Two Line Elements (TLE) data and satellite tracking, with powerful visualization capabilities.

<img src="assets/visual.png">

## Overview

This CLI tool provides functionalities to:
- Fetch and manage TLE (Two Line Elements) data
- Track satellite positions in real-time
- Generate satellite position reports
- Create 3D visualizations of satellite orbits
- Generate map links for satellite ground tracks
- Access Celestrak's satellite catalog
- Compare and analyze multiple satellite orbits

## Installation

```bash
go install github.com/Mohammed-Ashour/tlego@latest
```

## CLI Usage

The `tlego` CLI tool provides several commands to interact with TLE data and visualize satellite orbits.
### Installation
```bash
go install github.com/Mohammed-Ashour/tlego@latest
```
## General Command Structure

```bash
tlego <command> [arguments] [flags]
```

### Terminal UI

[![ISS walkthrough showing TUI browsing, tracking, prediction and JSON reporting](assets/tui-demo.gif)](https://github.com/Mohammed-Ashour/tlego/raw/refs/heads/main/assets/tui-demo.mp4)

[Watch the full MP4](https://github.com/Mohammed-Ashour/tlego/raw/refs/heads/main/assets/tui-demo.mp4). This walkthrough uses an offline ISS snapshot from 2026-10-24. [Run or re-record the example](docs/demos/README.md).

```bash
tlego tui
tlego tui --norad 25544
tlego tui --group "Space Stations"
tlego tui --track 25544
```

The terminal UI provides catalog browsing, cached name/ID searches, satellite details, live position updates, point-in-time predictions, report exports and observer settings. `--track` opens the tracking screen; Space starts or stops updates. Use `--screen Settings` to configure an observer.

- Left/Right or h/l switch screens. Escape leaves a text field; q returns Home and exits from Home.
- `/` focuses search. Enter searches the selected group or all groups if none is selected. Escape, then a searches all groups. Tab cycles lists and inputs; Enter opens a selection.
- On Track, Space toggles updates. On Predict, enter an RFC3339 timestamp, `now` or an offset such as `+2h` or `+0.5d`.
- On Reports, r generates, f selects text/JSON/CSV, Tab edits the save path and s saves after Escape.
- In Settings, Tab moves fields and Ctrl+S saves. Altitude is in km. Set your observer location before calculating passes.
- `?` shows help. Page Up/Page Down scroll long content. Ctrl+C exits from any field.

Cache and settings use the platform user directories. `XDG_CONFIG_HOME`, when set to an absolute path, overrides the settings directory. A failed refresh can use a validated stale cache and displays a warning. r reloads data while respecting the configured cache TTL.

Passes are sampled estimates at one-minute intervals, with clipped window boundaries marked. This initial TUI does not establish precision tracking, optical visibility, or complete coverage of modern six-digit catalog objects. Data retrieval still uses TLE input; GP/OMM support and shared-core work are tracked separately. The TUI report JSON is an unversioned export, not the planned extension contract.

See [TUI implementation notes](docs/tui-spec.md) and [the architecture](ARCHITECTURE.md). Existing CLI commands remain available below.

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

The tlego CLI is built on top of go-satellite-v2 for all orbital calculations. Here's how to use the CLI programmatically:

```go
package main

import (
    "fmt"
    "time"
    "github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
    "github.com/Mohammed-Ashour/tlego/pkg/celestrak"
)

func main() {
    // Fetch TLE from Celestrak
    tle, _ := celestrak.GetSatelliteTLEByNoradID("25544")

    // Create satellite using go-satellite-v2
    sat := satellite.NewSatelliteFromTLE(tle, satellite.GravityWGS84)

    // Get current position
    lat, lon, alt, _ := sat.Locate(time.Now())
    
    fmt.Printf("Position: %.6f°, %.6f°, %.6f km\n", lat, lon, alt)
}
```

---

## Features

- Seamless integration with go-satellite-v2 for high-precision orbit propagation
- Robust CLI interface for satellite tracking and visualization
- Real-time position tracking and orbit prediction
- Support for multiple mapping services (Google Maps, OpenStreetMap)
- Interactive 3D orbit visualization
- Comprehensive satellite group management
- Efficient TLE data fetching and caching

---

## Dependencies
- Go 1.22 or later
- github.com/Mohammed-Ashour/go-satellite-v2 (SGP4 propagation engine)
- gopkg.in/yaml.v3 (Configuration handling)

---

## Contributing
- Fork the repository
- Create your feature branch (`git checkout -b feature/amazing-feature`)
- Commit your changes (`git commit -m 'Add amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

---

## References & Credits

This project uses [go-satellite-v2](https://github.com/Mohammed-Ashour/go-satellite-v2) for SGP4 orbit propagation. 
The visualization and CLI components are original work built to provide an accessible interface for satellite tracking 
and analysis.

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
