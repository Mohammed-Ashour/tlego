package cmd

import (
	"context"
	"fmt"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/urfave/cli/v3"
)

func init() { RootCmd.Commands = append(RootCmd.Commands, newPassesCommand()) }
func newPassesCommand() *cli.Command {
	flags := append(sourceFlags(), machineFlags()...)
	flags = append(flags, &cli.StringFlag{Name: "time", Usage: "Window start in RFC3339 (default: now)"}, &cli.FloatFlag{Name: "lat", Usage: "Observer latitude in degrees", Required: true}, &cli.FloatFlag{Name: "lon", Usage: "Observer longitude in degrees", Required: true}, &cli.FloatFlag{Name: "alt", Usage: "Observer altitude in km"}, &cli.DurationFlag{Name: "duration", Value: 24 * time.Hour, Usage: "Forecast duration, up to 720h"}, &cli.DurationFlag{Name: "step", Value: time.Minute, Usage: "Sampling interval, at least 1s"})
	return &cli.Command{Name: "passes", Usage: "Estimate passes above the observer's horizon", ArgsUsage: "[NORAD-ID]", Flags: flags, Action: planPasses}
}
func planPasses(ctx context.Context, c *cli.Command) error {
	if err := checkFormat(c, false); err != nil {
		return commandError(c, err)
	}
	instant, err := evaluationTime(c, false)
	if err != nil {
		return commandError(c, err)
	}
	obs := orbit.Observer{Lat: c.Float("lat"), Lon: c.Float("lon"), Alt: c.Float("alt")}
	if err := obs.Validate(); err != nil {
		return commandError(c, err)
	}
	record, p, warnings, err := loadElement(ctx, c)
	if err != nil {
		return commandError(c, err)
	}
	duration, step := c.Duration("duration"), c.Duration("step")
	sat, err := orbit.New(record)
	if err != nil {
		return commandError(c, err)
	}
	passes, err := orbit.PlanPassesElementsContext(ctx, sat, obs, instant, duration, step)
	if err != nil {
		return commandError(c, err)
	}
	result := output.PassPlanV1(record.CatalogID, obs, instant, duration, step, passes)
	warnings = append(warnings, output.Warning{Code: "sampled_passes", Message: "Pass events are sampled estimates; optical visibility is not calculated."})
	if c.String("format") == "json" {
		return emitResult(c, "passes", result, p, warnings)
	}
	printWarnings(c, warnings)
	fmt.Fprintf(c.Writer, "Pass estimates for %s (%s), %s through %s\n", record.Name, record.CatalogID, result.WindowStart.Format(time.RFC3339), result.WindowEnd.Format(time.RFC3339))
	for _, pass := range result.Passes {
		fmt.Fprintf(c.Writer, "%s to %s | max %.2f° at %s | clipped start=%t end=%t\n", pass.Start.Format(time.RFC3339), pass.End.Format(time.RFC3339), pass.MaximumElevationDeg, pass.MaximumAt.Format(time.RFC3339), pass.StartClipped, pass.EndClipped)
	}
	if len(passes) == 0 {
		fmt.Fprintln(c.Writer, "No passes above the horizon in this window.")
	}
	return nil
}
