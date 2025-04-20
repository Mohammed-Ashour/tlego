package main

import (
	"fmt"
	"log"
	"time"

	gosatellite "github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
)

func main() {
	// Use ISS as an example
	noradID := "25544"

	// Fetch TLE data
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradID)
	if err != nil {
		log.Fatalf("Failed to fetch TLE: %v", err)
	}

	// Initialize our satellite

	// Initialize go-satellite's implementation
	goSat := gosatellite.TLEToSat(tle.Line1.LineString, tle.Line2.LineString, gosatellite.GravityWGS84)

	// Current time for prediction
	now := time.Now()

	// Calculate position using our implementation
	if err != nil {
		log.Fatalf("Our implementation failed: %v", err)
	}

	// Get our velocity
	if err != nil {
		log.Fatalf("Failed to calculate velocity: %v", err)
	}

	// Calculate minutes since epoch for go-satellite
	jday := gosatellite.JDay(now.Year(), int(now.Month()), now.Day(),
		now.Hour(), now.Minute(), int(now.Second()))

	// Calculate position using go-satellite
	goPos, goVel := gosatellite.Propagate(goSat, now.Year(), int(now.Month()), now.Day(),
		now.Hour(), now.Minute(), int(now.Second()))
	goAlt, _, goLatLon := gosatellite.ECIToLLA(goPos, jday)
	lat, lon, alt, _ := goSat.Locate(now)
	fmt.Println(generateReport(tle, lat, lon, alt, now))
	// Print comparison
	fmt.Printf("Satellite: %s (NORAD ID: %s)\n", tle.Name, noradID)
	fmt.Printf("Time: %s\n", now.Format(time.RFC3339))

	fmt.Println("Position Comparison:")
	fmt.Printf("%-20s %13s %13s %13s\n", "Implementation", "Latitude", "Longitude", "Altitude")
	fmt.Printf("%-20s %12.6f° %12.6f° %12.6f km\n", "go-satellite", goLatLon.Latitude, goLatLon.Longitude, goAlt)
	fmt.Printf("%-20s %12.6f° %12.6f° %12.6f km\n", "go-satellite-Locate", lat, lon, alt)
	fmt.Println("\nVelocity Comparison (km/s):")
	fmt.Printf("%-20s %13s %13s %13s\n", "Implementation", "X", "Y", "Z")
	fmt.Printf("%-20s %12.6f %12.6f %12.6f\n", "go-satellite", goVel.X, goVel.Y, goVel.Z)

	fmt.Println("\nDifferences:")
	fmt.Printf("Position:\n")
	fmt.Printf("Velocity (km/s):\n")
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
func generateReport(tle tle.TLE, lat, lon, alt float64, now time.Time) string {
	// Format the report

	report := fmt.Sprintf(`
Satellite Report
================
Name: %s
NORAD ID: %s

TLE Data:
---------
%s


Current Position (as of %s):
----------------------------
Latitude: %.6f°
Longitude: %.6f°
Altitude: %.6f

Google Maps URL:
----------------
%s
`,
		tle.Name,
		tle.NoradID,
		tle.String(),
		now.Format(time.RFC3339),
		lat,
		lon,
		alt,

		locate.GetGoogleMapsURL(lat, lon),
	)

	return report
}
