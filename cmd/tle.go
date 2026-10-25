package cmd

import (
	"context"
	"fmt"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{Name: "tle", Usage: "Read satellite elements", ArgsUsage: "[NORAD-ID]", Flags: sourceFlags(), Action: tleGrep})
}
func tleGrep(ctx context.Context, c *cli.Command) error {
	record, _, warnings, err := loadElement(ctx, c)
	if err != nil {
		return err
	}
	printWarnings(c, warnings)
	_, err = fmt.Fprintln(c.Writer, record.String())
	return err
}
