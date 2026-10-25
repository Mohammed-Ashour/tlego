package cmd

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{Name: "search", Usage: "Search catalog names and IDs", ArgsUsage: "<keyword>", Flags: cacheFlags(), Action: searchSatellites})
}
func searchSatellites(ctx context.Context, c *cli.Command) error {
	if c.Args().Len() != 1 || strings.TrimSpace(c.Args().First()) == "" {
		return fmt.Errorf("provide one search keyword")
	}
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	result, err := commandStore(c).Search(ctx, c.Args().First())
	if err != nil {
		return err
	}
	if len(result.Warnings) > 0 {
		fmt.Fprintf(c.ErrWriter, "Search coverage: %d/%d groups loaded\n", result.GroupsCovered, result.GroupsTotal)
		for _, warning := range result.Warnings {
			fmt.Fprintln(c.ErrWriter, warning)
		}
	}
	if len(result.TLEs) == 0 {
		fmt.Fprintf(c.Writer, "No satellites found matching keyword: %q\n", c.Args().First())
		return nil
	}
	for _, record := range result.TLEs {
		fmt.Fprintf(c.Writer, "Name: %s | NORAD ID: %s\n", record.Name, record.NoradID)
	}
	return nil
}
