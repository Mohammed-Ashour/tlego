package cmd

import (
	"context"
	"fmt"
	"strings"

	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{Name: "tle", Usage: "Read legacy Two-Line Element text", ArgsUsage: "[NORAD-ID]", Flags: sourceFlags(), Action: tleGrep})
}
func tleGrep(ctx context.Context, c *cli.Command) error {
	if c.String("file") != "" {
		record, _, warnings, err := loadElement(ctx, c)
		if err != nil {
			return err
		}
		if record.LegacyTLE == nil {
			return fmt.Errorf("GP JSON has no original TLE text; use report --format json to read these elements")
		}
		printWarnings(c, warnings)
		_, err = fmt.Fprintln(c.Writer, record.LegacyTLE.String())
		return err
	}
	if c.Args().Len() != 1 {
		return fmt.Errorf("provide one NORAD ID or --file <TLE-file>")
	}
	id := c.Args().First()
	if err := validateNoradID(id); err != nil {
		return err
	}
	if len(strings.TrimLeft(id, "0")) > 5 {
		return fmt.Errorf("catalog ID %s cannot be represented in TLE text; use predict, report, passes or viz for GP JSON support", id)
	}
	record, meta, err := commandStore(c).FetchTLEByNorad(ctx, id)
	if err != nil {
		return err
	}
	if meta.Warning != "" {
		fmt.Fprintln(c.ErrWriter, meta.Warning)
	}
	_, err = fmt.Fprintln(c.Writer, record.String())
	return err
}
