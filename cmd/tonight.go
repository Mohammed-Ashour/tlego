package cmd

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/Mohammed-Ashour/tlego/pkg/tui"
	"github.com/urfave/cli/v3"
)

const (
	defaultTonightID  = "25544"
	darkSearchLimit   = 24 * time.Hour
	oldElementsWarnAt = 3 * 24 * time.Hour
)

func init() { RootCmd.Commands = append(RootCmd.Commands, newTonightCommand()) }

func newTonightCommand() *cli.Command {
	defaults := orbit.DefaultVisibility()
	flags := append(sourceFlags(), machineFlags()...)
	flags = append(flags,
		&cli.StringFlag{Name: "time", Usage: "Search from this RFC3339 time (default: now)"},
		&cli.FloatFlag{Name: "lat", Usage: "Observer latitude in degrees (default: TUI settings)"},
		&cli.FloatFlag{Name: "lon", Usage: "Observer longitude in degrees (default: TUI settings)"},
		&cli.FloatFlag{Name: "alt", Usage: "Observer altitude in km"},
		&cli.FloatFlag{Name: "min-elevation", Value: defaults.MinElevationDeg, Usage: "Lowest useful elevation in degrees"},
		&cli.FloatFlag{Name: "max-sun-elevation", Value: defaults.MaxSunElevationDeg, Usage: "Highest Sun elevation that counts as dark, in degrees"},
		&cli.BoolFlag{Name: "utc", Usage: "Print times in UTC instead of local time"},
	)
	return &cli.Command{
		Name:        "tonight",
		Usage:       "List passes you can see with the naked eye in the next dark period",
		ArgsUsage:   "[NORAD-ID]",
		Description: "Checks the next dark period for passes where the satellite is sunlit and above the minimum elevation. Without an ID, it uses the ISS. Weather and brightness are not considered.",
		Flags:       flags,
		Action:      planTonight,
	}
}

// tonightObserver prefers flags, then settings. The all-zero default observer
// counts as unset, because it would otherwise give confident answers for the wrong place.
func tonightObserver(c *cli.Command) (orbit.Observer, error) {
	if c.IsSet("lat") != c.IsSet("lon") {
		return orbit.Observer{}, fmt.Errorf("provide both --lat and --lon")
	}
	var obs orbit.Observer
	if c.IsSet("lat") {
		obs = orbit.Observer{Lat: c.Float("lat"), Lon: c.Float("lon"), Alt: c.Float("alt")}
	} else {
		settings, err := tui.LoadSettings()
		if err != nil {
			return orbit.Observer{}, fmt.Errorf("read observer settings: %w", err)
		}
		obs = settings.Observer
		if obs.Lat == 0 && obs.Lon == 0 {
			return orbit.Observer{}, fmt.Errorf("no observer location: use --lat and --lon, or set it with tlego tui --screen Settings")
		}
		if c.IsSet("alt") {
			obs.Alt = c.Float("alt")
		}
	}
	return obs, obs.Validate()
}

func planTonight(ctx context.Context, c *cli.Command) error {
	if err := checkFormat(c, false); err != nil {
		return commandError(c, err)
	}
	from, err := evaluationTime(c, false)
	if err != nil {
		return commandError(c, err)
	}
	obs, err := tonightObserver(c)
	if err != nil {
		return commandError(c, err)
	}
	criteria := orbit.Visibility{MinElevationDeg: c.Float("min-elevation"), MaxSunElevationDeg: c.Float("max-sun-elevation")}
	if err := criteria.Validate(); err != nil {
		return commandError(c, err)
	}
	record, provenance, warnings, err := loadElementDefault(ctx, c, defaultTonightID)
	if err != nil {
		return commandError(c, err)
	}
	prop, err := orbit.New(record)
	if err != nil {
		return commandError(c, err)
	}
	warnings = append(warnings, elementAgeWarnings(record, from)...)
	window, found, err := orbit.NextDarkWindow(obs, from, darkSearchLimit, criteria.MaxSunElevationDeg)
	if err != nil {
		return commandError(c, err)
	}
	var darkWindow *orbit.DarkWindow
	var passes []orbit.VisiblePass
	if found {
		darkWindow = &window
		passes, err = orbit.PlanVisiblePasses(ctx, prop, obs, window.Start, window.End.Sub(window.Start), criteria)
		if err != nil {
			return commandError(c, err)
		}
	}
	warnings = append(warnings, output.Warning{Code: "estimated_visibility", Message: "Visibility is a geometric estimate. It does not consider weather, brightness or local obstructions."})
	if c.String("format") == "json" {
		return emitResult(c, "tonight", output.TonightV1(record.Name, record.CatalogID, obs, darkWindow, criteria, passes), provenance, warnings)
	}
	printWarnings(c, warnings)
	location := time.Local
	if c.Bool("utc") {
		location = time.UTC
	}
	writeTonight(c.Writer, record, obs, darkWindow, criteria, passes, location)
	return nil
}

func elementAgeWarnings(record elements.Record, at time.Time) []output.Warning {
	epoch, err := record.Time()
	if err != nil {
		return nil
	}
	age := at.Sub(epoch)
	if age < 0 {
		age = -age
	}
	if age <= oldElementsWarnAt {
		return nil
	}
	return []output.Warning{{Code: "distant_epoch", Message: fmt.Sprintf("Element epoch %s is %.0f days from the requested time, so predicted times may be well off.", epoch.UTC().Format(time.RFC3339), age.Hours()/24)}}
}

func writeTonight(w io.Writer, record elements.Record, obs orbit.Observer, window *orbit.DarkWindow, criteria orbit.Visibility, passes []orbit.VisiblePass, location *time.Location) {
	fmt.Fprintf(w, "%s (%s) from %.4f°, %.4f°\n", record.Name, record.CatalogID, obs.Lat, obs.Lon)
	if window == nil {
		fmt.Fprintf(w, "The Sun stays above %.0f° for the next %.0f hours, so the sky will not be dark enough.\n", criteria.MaxSunElevationDeg, darkSearchLimit.Hours())
		return
	}
	dayTime := "Mon 2 Jan 15:04 MST"
	fmt.Fprintf(w, "Dark sky: %s to %s", window.Start.In(location).Format(dayTime), window.End.In(location).Format(dayTime))
	if window.Clipped {
		fmt.Fprint(w, " or later")
	}
	fmt.Fprint(w, "\n\n")
	if len(passes) == 0 {
		fmt.Fprintf(w, "No visible passes above %.0f° in this period.\n", criteria.MinElevationDeg)
		return
	}
	for _, pass := range passes {
		fmt.Fprintf(w, "%s  visible for %s\n", pass.Start.Time.In(location).Format("Mon 2 Jan"), formatMinutes(pass.End.Time.Sub(pass.Start.Time)))
		fmt.Fprintln(w, describePoint("appears", pass.Start, location))
		fmt.Fprintln(w, describePoint("highest", pass.Peak, location))
		last := "ends"
		if pass.EndsInShadow {
			last = "fades"
		}
		fmt.Fprintln(w, describePoint(last, pass.End, location))
	}
}

func describePoint(label string, point orbit.LookPoint, location *time.Location) string {
	return fmt.Sprintf("  %-8s %s  %2.0f° above %s", label, point.Time.In(location).Format("15:04:05"), point.ElevationDeg, orbit.CompassPoint(point.AzimuthDeg))
}

func formatMinutes(d time.Duration) string {
	d = d.Round(time.Second)
	minutes := int(d / time.Minute)
	seconds := int((d % time.Minute) / time.Second)
	if minutes == 0 {
		return fmt.Sprintf("%ds", seconds)
	}
	return fmt.Sprintf("%dm %02ds", minutes, seconds)
}
