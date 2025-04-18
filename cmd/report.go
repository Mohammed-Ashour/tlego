package cmd

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	"github.com/Mohammed-Ashour/tlego/pkg/sgp4"
	"github.com/Mohammed-Ashour/tlego/pkg/tle"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "report",
		Usage:       "tlego report <NORAD-ID>",
		Description: "Generate a detailed report for a satellite identified by its NORAD ID.",
		Action:      generateSatelliteReport,
		Category:    "Reporting",
	})
}

func generateSatelliteReport(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() == 0 {
		return errors.New("please provide a NORAD ID for the satellite to generate a report")
	}

	noradID := args.First()
	err := validateNoradID(noradID)
	if err != nil {
		return err
	}

	// Fetch TLE data for the satellite
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradID)
	if err != nil {
		return fmt.Errorf("failed to fetch TLE for NORAD ID %s: %w", noradID, err)
	}

	// Create a satellite object from the TLE
	satellite := sgp4.NewSatelliteFromTLE(tle)

	// Calculate the satellite's current position
	now := time.Now()
	lat, lon, alt, err := locate.CalculatePositionLLA(satellite, now)
	if err != nil {
		logger.Error("Failed to calculate satellite position", "error", err)
		return fmt.Errorf("failed to calculate satellite position: %w", err)
	}

	// Generate the report
	report := generateReport(tle, satellite, lat, lon, alt, now)

	// Display the report
	fmt.Println(report)

	return nil
}

func generateReport(tle tle.TLE, satellite sgp4.Satellite, lat, lon, alt float64, now time.Time) string {
	// Format the report
	report := fmt.Sprintf(`
Satellite Report
================
Name: %s
NORAD ID: %s

TLE Data:
---------
%s

Orbital Parameters:
--------------------
Inclination: %.6f° (degrees)
Eccentricity: %.6f
Mean Motion: %.6f (revolutions per day)
Altitude: %.2f km

Current Position (as of %s):
----------------------------
Latitude: %.6f°
Longitude: %.6f°
Altitude: %.2f km

Google Maps URL:
----------------
https://www.google.com/maps/?q=%.6f,%.6f
`,
		tle.Name,
		tle.NoradID,
		tle.String(),
		satellite.Inclo*180.0/3.141592653589793, // Convert radians to degrees
		satellite.Ecco,
		satellite.NoKozai,
		alt,
		now.Format(time.RFC3339),
		lat,
		lon,
		alt,
		lat,
		lon,
	)

	return report
}
