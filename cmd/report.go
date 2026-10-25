package cmd

import (
	"context"
	"fmt"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
	"github.com/urfave/cli/v3"
)

func init() { RootCmd.Commands = append(RootCmd.Commands, newReportCommand()) }
func newReportCommand() *cli.Command {
	flags := append(sourceFlags(), machineFlags()...)
	flags = append(flags, &cli.StringFlag{Name: "time", Usage: "Evaluation time in RFC3339 (default: now)"})
	return &cli.Command{Name: "report", Usage: "Generate a satellite report", ArgsUsage: "[NORAD-ID]", Flags: flags, Action: generateSatelliteReport}
}
func generateSatelliteReport(ctx context.Context, c *cli.Command) error {
	if err := checkFormat(c, true); err != nil {
		return commandError(c, err)
	}
	instant, err := evaluationTime(c, false)
	if err != nil {
		return commandError(c, err)
	}
	record, p, warnings, err := loadElement(ctx, c)
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
	info, err := orbit.OrbitInfoFromElements(record)
	if err != nil {
		return commandError(c, err)
	}
	report, err := output.BuildElementReportAt(record, orbit.Position{Time: state.Time, LatDeg: state.LatDeg, LonDeg: state.LonDeg, AltKm: state.AltKm, VelocityKm: state.SpeedKmS}, info, locate.GetGoogleMapsURL(state.LatDeg, state.LonDeg), time.Now())
	if err != nil {
		return commandError(c, err)
	}
	if c.String("format") == "json" {
		return emitResult(c, "report", output.ReportV1(report), p, warnings)
	}
	printWarnings(c, warnings)
	text := output.FormatReportText(report)
	if c.String("format") == "csv" {
		text, err = output.FormatReportCSV(report)
		if err != nil {
			return err
		}
	}
	_, err = fmt.Fprint(c.Writer, text)
	return err
}

// Retain the original report helper for callers and compatibility tests.
func generateReport(element tle.TLE, lat, lon, alt float64, now time.Time) string {
	return fmt.Sprintf("\nSatellite Report\n================\nName: %s\nNORAD ID: %s\n\nTLE Data:\n---------\n%s\n\nCurrent Position (as of %s):\n----------------------------\nLatitude: %.6f°\nLongitude: %.6f°\nAltitude: %.6f km\n\nGoogle Maps URL:\n----------------\n%s\n", element.Name, element.NoradID, element.String(), now.Format(time.RFC3339), lat, lon, alt, locate.GetGoogleMapsURL(lat, lon))
}
