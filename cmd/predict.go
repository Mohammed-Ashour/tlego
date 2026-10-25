package cmd

import (
	"context"
	"fmt"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
	"github.com/urfave/cli/v3"
)

func init() { RootCmd.Commands = append(RootCmd.Commands, newPredictCommand()) }
func newPredictCommand() *cli.Command {
	flags := append(sourceFlags(), machineFlags()...)
	flags = append(flags, &cli.StringFlag{Name: "time", Usage: "Evaluation time in RFC3339"})
	return &cli.Command{Name: "predict", Usage: "Predict a satellite position", ArgsUsage: "[NORAD-ID]", Flags: flags, Action: predictSatellitePosition}
}
func predictSatellitePosition(ctx context.Context, c *cli.Command) error {
	if err := checkFormat(c, false); err != nil {
		return commandError(c, err)
	}
	instant, err := evaluationTime(c, true)
	if err != nil {
		return commandError(c, err)
	}
	record, provenance, warnings, err := loadElement(ctx, c)
	if err != nil {
		return commandError(c, err)
	}
	sat, err := orbit.New(record)
	if err != nil {
		return commandError(c, err)
	}
	state, err := sat.At(instant)
	if err != nil {
		return commandError(c, err)
	}
	if err := orbit.ValidateState(state); err != nil {
		return commandError(c, err)
	}
	if c.String("format") == "json" {
		return emitResult(c, "position", output.PositionV1(record.CatalogID, state), provenance, warnings)
	}
	printWarnings(c, warnings)
	fmt.Fprintf(c.Writer, "Satellite: %s (NORAD ID: %s)\nPrediction Time: %s\nSatellite Position: Latitude %.6f°, Longitude %.6f°, Altitude %.6f km\nSpeed: %.6f km/s\nGoogle Maps URL: %s\n", record.Name, record.CatalogID, state.Time.Format(time.RFC3339), state.LatDeg, state.LonDeg, state.AltKm, state.SpeedKmS, locate.GetGoogleMapsURL(state.LatDeg, state.LonDeg))
	return nil
}
func parseTime(value string) (time.Time, error) {
	t, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return time.Time{}, fmt.Errorf("time must be RFC3339, for example 2026-10-25T12:00:00Z: %w", err)
	}
	return t, nil
}
