package cmd

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
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
	sat := satellite.NewSatelliteFromTLE(tle, satellite.GravityWGS84)

	// Calculate the satellite's current position
	now := time.Now()
	lat, lon, alt, _ := sat.Locate(now)
	fmt.Println(alt)
	fmt.Println("------")

	// Generate the report
	report := generateReport(tle, lat, lon, alt, now)

	// Display the report
	fmt.Println(report)

	return nil
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
