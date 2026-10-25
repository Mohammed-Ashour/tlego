package cmd

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "track",
		Usage:       "tlego track <NORAD-ID>",
		Description: "Continuously track the real-time position of a satellite using its NORAD ID.",
		Action:      trackSatellite,
		Flags:       sourceFlags(),
		Category:    "Tracking",
	})
}

func trackSatellite(ctx context.Context, cmd *cli.Command) error {
	record, _, warnings, err := loadElement(ctx, cmd)
	if err != nil {
		return err
	}
	printWarnings(cmd, warnings)

	// Create a satellite object from the TLE
	sat, err := orbit.New(record)
	if err != nil {
		return commandError(cmd, err)
	}

	// Set up signal handling for graceful exit
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(signalChan)

	fmt.Fprintf(cmd.Writer, "Tracking satellite: %s (NORAD ID: %s)\n", record.Name, record.CatalogID)
	fmt.Fprintln(cmd.Writer, "Press Ctrl+C to stop tracking.")

	// Start tracking loop
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-signalChan:
			fmt.Fprintln(cmd.Writer, "\nTracking stopped.")
			return nil
		case <-ticker.C:
			// Calculate the satellite's real-time position
			position, err := sat.At(time.Now())
			if err != nil {
				return err
			}
			if err := orbit.ValidateState(position); err != nil {
				return err
			}

			// Format altitude string with explanation for negative values

			// Display the position
			fmt.Fprintf(cmd.Writer, "\rTime: %s | Latitude: %.6f° | Longitude: %.6f° | Altitude: %.6f km\n",
				position.Time.Format(time.RFC3339), position.LatDeg, position.LonDeg, position.AltKm)
		}
	}
}
