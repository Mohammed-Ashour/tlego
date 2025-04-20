package cmd

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "predict",
		Usage:       "tlego predict <NORAD-ID> --time <timestamp>",
		Description: "Show where a satellite will be at a specific time.",
		Action:      predictSatellitePosition,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:     "time",
				Usage:    "Specify the time in ISO 8601 format (e.g., 2024-02-26T12:00:00Z)",
				Required: true,
			},
		},
		Category: "Prediction",
	})
}

func predictSatellitePosition(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() == 0 {
		return errors.New("please provide a NORAD ID for the satellite to predict its position")
	}

	noradID := args.First()
	err := validateNoradID(noradID)
	if err != nil {
		return err
	}

	// Parse time flag
	timeStr := cmd.String("time")
	predictionTime, err := parseTime(timeStr)
	if err != nil {
		return fmt.Errorf("invalid time format: %w", err)
	}

	// Fetch TLE data for the satellite
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradID)
	if err != nil {
		return fmt.Errorf("failed to fetch TLE for NORAD ID %s: %w", noradID, err)
	}

	// Create a satellite object from the TLE
	satellite := satellite.NewSatelliteFromTLE(tle, satellite.GravityWGS84)

	// Calculate the satellite's position at the specified time

	lat, lon, alt, _ := satellite.Locate(predictionTime)

	// Display the results
	fmt.Printf("Satellite: %s (NORAD ID: %s)\n", tle.Name, noradID)
	fmt.Printf("Prediction Time: %s\n", predictionTime.Format(time.RFC3339))
	fmt.Printf("Satellite Position: Latitude %.6f, Longitude %.6f, Altitude %.6f\n", lat, lon, alt)

	// Generate Google Maps URL
	googlMapsUrl := locate.GetGoogleMapsURL(lat, lon)
	fmt.Printf("Google Maps URL: %s\n", googlMapsUrl)

	return nil
}

// parseTime parses the --time flag into a time.Time object
func parseTime(timeStr string) (time.Time, error) {
	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		return time.Time{}, fmt.Errorf("time must be in ISO 8601 format (e.g., 2024-02-26T12:00:00Z): %w", err)
	}
	return parsedTime, nil
}
