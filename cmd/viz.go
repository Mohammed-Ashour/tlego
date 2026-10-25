package cmd

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/pkg/visual"
	"github.com/urfave/cli/v3"
)

func init() { RootCmd.Commands = append(RootCmd.Commands, newVizCommand()) }

func newVizCommand() *cli.Command {
	return &cli.Command{
		Name: "viz", Usage: "Export a self-contained interactive orbit viewer", Category: "Visualization",
		ArgsUsage: "[NORAD-ID]",
		Flags: append(cacheFlags(), []cli.Flag{
			&cli.StringFlag{Name: "file", Usage: "Read validated TLE records from a local file instead of fetching an ID"},
			&cli.StringFlag{Name: "output", Aliases: []string{"o"}, Usage: "HTML output path (default: ID.html or input-name.html)"},
			&cli.StringFlag{Name: "time", Usage: "Start time in RFC3339 (default: now for live data, first element epoch for a file)"},
			&cli.IntFlag{Name: "points", Value: 360, Usage: "Samples per orbit, including endpoints (2 to 4096)"},
		}...), Action: visualizeSatelliteOrbit,
	}
}

func visualizeSatelliteOrbit(ctx context.Context, command *cli.Command) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	file := command.String("file")
	if (file == "" && command.Args().Len() != 1) || (file != "" && command.Args().Len() != 0) {
		return fmt.Errorf("use viz <NORAD-ID> or viz --file <TLE-file>")
	}
	requestedCount := command.Int("points")
	if requestedCount < 2 || requestedCount > 4096 {
		return fmt.Errorf("points must be between 2 and 4096")
	}
	count := int(requestedCount)
	var start time.Time
	if value := command.String("time"); value != "" {
		parsed, err := time.Parse(time.RFC3339, value)
		if err != nil {
			return fmt.Errorf("invalid start time: %w", err)
		}
		start = parsed.UTC()
	}
	var records []tle.TLE
	var err error
	var defaultName string
	if file != "" {
		records, err = catalog.ReadLocalTLE(file)
		defaultName = strings.TrimSuffix(filepath.Base(file), filepath.Ext(file)) + ".html"
	} else {
		id := command.Args().First()
		var record tle.TLE
		var meta catalog.FetchMeta
		record, meta, err = commandStore(command).FetchTLEByNorad(ctx, id)
		if meta.Warning != "" {
			fmt.Fprintln(command.ErrWriter, meta.Warning)
		}
		records = []tle.TLE{record}
		defaultName = id + ".html"
		if start.IsZero() {
			start = time.Now().UTC()
		}
	}
	if err != nil {
		return fmt.Errorf("load orbit elements: %w", err)
	}
	if len(records) == 0 || len(records) > 64 {
		return fmt.Errorf("visualization needs 1 to 64 satellite records")
	}
	if len(records)*count > 250000 {
		return fmt.Errorf("export exceeds 250000 total samples; reduce --points or the number of records")
	}
	if start.IsZero() {
		start, err = records[0].Time()
		if err != nil {
			return fmt.Errorf("read first element epoch: %w", err)
		}
	}
	satellites := make([]visual.SatelliteData, 0, len(records))
	for _, record := range records {
		points, err := visual.CreateOrbitPointsAt(record, count, start)
		if err != nil {
			return fmt.Errorf("sample %s: %w", record.Name, err)
		}
		epoch, err := record.Time()
		if err != nil {
			return err
		}
		satellites = append(satellites, visual.SatelliteData{Name: record.Name, NORADID: record.NoradID, Epoch: epoch, Points: points})
	}
	path := command.String("output")
	if path == "" {
		path = defaultName
	}
	written, err := visual.WriteHTMLVisual(satellites, path)
	if err != nil {
		return fmt.Errorf("export orbit viewer: %w", err)
	}
	fmt.Fprintln(command.Writer, written)
	return nil
}
