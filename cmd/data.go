package cmd

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/urfave/cli/v3"
)

func cacheFlags() []cli.Flag {
	return []cli.Flag{
		&cli.StringFlag{Name: "cache-dir", Usage: "Element cache directory (default: platform user cache)"},
		&cli.DurationFlag{Name: "cache-ttl", Value: 12 * time.Hour, Usage: "Cache freshness interval", Validator: func(v time.Duration) error {
			if v <= 0 {
				return fmt.Errorf("cache-ttl must be positive")
			}
			return nil
		}},
	}
}
func sourceFlags() []cli.Flag {
	return append(cacheFlags(), &cli.StringFlag{Name: "file", Usage: "Read a single satellite from a local TLE file; - reads stdin"})
}
func machineFlags() []cli.Flag {
	return []cli.Flag{&cli.StringFlag{Name: "format", Value: "text", Usage: "Output format: text or json"}, &cli.StringFlag{Name: "schema-version", Value: output.SchemaVersion, Usage: "JSON schema version"}}
}
func commandStore(c *cli.Command) *catalog.Store {
	ttl := c.Duration("cache-ttl")
	if ttl <= 0 {
		ttl = 12 * time.Hour
	}
	return catalog.NewStore(c.String("cache-dir"), ttl)
}
func checkFormat(c *cli.Command, csv bool) error {
	format := c.String("format")
	if format == "" {
		format = "text"
	}
	if format != "text" && format != "json" && !(csv && format == "csv") {
		return fmt.Errorf("unsupported output format %q", format)
	}
	if format == "json" {
		return output.ValidateVersion(c.String("schema-version"))
	}
	return nil
}
func evaluationTime(c *cli.Command, required bool) (time.Time, error) {
	if value := c.String("time"); value != "" {
		t, err := parseTime(value)
		return t.UTC().Truncate(time.Second), err
	}
	if required {
		return time.Time{}, fmt.Errorf("provide --time as an RFC3339 timestamp")
	}
	return time.Now().UTC().Truncate(time.Second), nil
}

func loadElement(ctx context.Context, c *cli.Command) (tle.TLE, output.Provenance, []output.Warning, error) {
	var record tle.TLE
	var provenance output.Provenance
	var warnings []output.Warning
	file := c.String("file")
	if file != "" {
		if c.Args().Len() != 0 {
			return record, provenance, warnings, fmt.Errorf("use a NORAD ID or --file, not both")
		}
		var records []tle.TLE
		var err error
		if file == "-" {
			contents, readErr := io.ReadAll(io.LimitReader(c.Reader, (32<<20)+1))
			err = readErr
			if err == nil {
				if len(contents) > 32<<20 {
					err = fmt.Errorf("TLE input exceeds 32 MiB")
				} else {
					records, err = catalog.ParseTLE(contents)
				}
			}
		} else {
			records, err = catalog.ReadLocalTLE(file)
		}
		if err != nil {
			return record, provenance, warnings, err
		}
		if len(records) != 1 {
			return record, provenance, warnings, fmt.Errorf("this command requires exactly one satellite record")
		}
		record = records[0]
		provenance = output.Provenance{Source: "file", SourceFormat: "tle", CacheStatus: "none"}
		if file == "-" {
			provenance.Source = "stdin"
		}
	} else {
		if c.Args().Len() != 1 {
			return record, provenance, warnings, fmt.Errorf("provide one NORAD ID or --file <TLE-file>")
		}
		var meta catalog.FetchMeta
		var err error
		record, meta, err = commandStore(c).FetchTLEByNorad(ctx, c.Args().First())
		if err != nil {
			return record, provenance, warnings, err
		}
		fetched := meta.FetchedAt.UTC()
		provenance = output.Provenance{Source: "celestrak", SourceFormat: "tle", FetchedAt: &fetched, CacheStatus: "fetched"}
		if meta.FromCache {
			provenance.CacheStatus = "fresh"
		}
		if meta.Stale {
			provenance.CacheStatus = "stale"
		}
		if meta.Warning != "" {
			warnings = append(warnings, output.Warning{Code: "stale_elements", Message: meta.Warning})
		}
	}
	epoch, err := record.Time()
	if err != nil {
		return record, provenance, warnings, err
	}
	provenance.ElementEpoch = epoch.UTC()
	return record, provenance, warnings, nil
}

type machineError struct{ error }

func (machineError) Reported() bool { return true }
func commandError(c *cli.Command, err error) error {
	if err == nil {
		return nil
	}
	if c.String("format") == "json" {
		fmt.Fprintln(c.ErrWriter, string(output.MarshalError("command_failed", err)))
		return machineError{err}
	}
	return err
}
func emitResult(c *cli.Command, kind string, data any, p output.Provenance, warnings []output.Warning) error {
	b, err := output.MarshalResult(kind, data, p, warnings)
	if err != nil {
		return commandError(c, err)
	}
	_, err = fmt.Fprintln(c.Writer, string(b))
	return err
}
func printWarnings(c *cli.Command, warnings []output.Warning) {
	for _, w := range warnings {
		fmt.Fprintln(c.ErrWriter, w.Message)
	}
}
func validateNoradID(id string) error { return catalog.ValidateNoradID(strings.TrimSpace(id)) }
