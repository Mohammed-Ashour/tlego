package cmd

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/urfave/cli/v3"
)

func init() {
	flags := append(cacheFlags(), &cli.StringFlag{Name: "sat-group", Usage: "Satellite group (case-insensitive)"})
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{Name: "list", Usage: "List groups or retrieve a group's elements", Flags: flags, Action: listAction})
}
func listAction(ctx context.Context, c *cli.Command) error {
	store := commandStore(c)
	if group := c.String("sat-group"); group != "" {
		records, meta, err := store.FetchGroupElements(ctx, group)
		if err != nil {
			return err
		}
		if meta.Warning != "" {
			fmt.Fprintln(c.ErrWriter, meta.Warning)
		}
		if meta.Format == "gp-json" {
			objects := make([]json.RawMessage, len(records))
			for i, record := range records {
				objects[i] = record.Raw
			}
			return json.NewEncoder(c.Writer).Encode(objects)
		}
		for _, record := range records {
			fmt.Fprintln(c.Writer, record.String())
		}
		return nil
	}
	groups, err := store.FetchGroups()
	if err != nil {
		return err
	}
	fmt.Fprintln(c.Writer, "Groups supported:")
	for _, g := range groups {
		fmt.Fprintln(c.Writer, "\t"+g.Name)
	}
	return nil
}
