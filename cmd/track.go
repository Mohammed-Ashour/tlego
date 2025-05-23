package cmd

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "track",
		Usage:       "tlego track <NORAD-ID>",
		Description: "Continuously track the real-time position of a satellite using its NORAD ID.",
		Action:      trackSatellite,
		Category:    "Tracking",
	})
}

func trackSatellite(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() == 0 {
		return fmt.Errorf("please provide a NORAD ID for the satellite to track")
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

	// Set up signal handling for graceful exit
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	fmt.Printf("Tracking satellite: %s (NORAD ID: %s)\n", tle.Name, noradID)
	fmt.Println("Press Ctrl+C to stop tracking.")

	// Start tracking loop
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-signalChan:
			fmt.Println("\nTracking stopped.")
			return nil
		case <-ticker.C:
			// Calculate the satellite's real-time position
			now := time.Now()
			latitude, longitude, altitude, _ := sat.Locate(now)

			// Format altitude string with explanation for negative values

			// Display the position
			fmt.Printf("\rTime: %s | Latitude: %.6f | Longitude: %.6f | Altitude: %.6f\n",
				now.Format(time.RFC3339), latitude, longitude, altitude)
		}
	}
}
