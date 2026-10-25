package cmd

import (
	"context"
	"fmt"
	"path/filepath"

	"github.com/Mohammed-Ashour/tlego/internal/extensions"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Description += "\n\nExecutable extensions named tlego-<command> on PATH are available as tlego <command>. Use 'tlego plugin list' to inspect them or 'tlego plugin init' to create one."
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name: "plugin", Usage: "Manage executable command extensions",
		Commands: []*cli.Command{newPluginInitCommand(), {
			Name: "list", Usage: "List executable command extensions found on PATH",
			Action: func(_ context.Context, _ *cli.Command) error {
				for _, plugin := range extensions.Discover() {
					if _, err := fmt.Fprintf(RootCmd.Writer, "%s\t%s", plugin.Name, plugin.Executable); err != nil {
						return err
					}
					for _, candidate := range plugin.Candidates[1:] {
						if _, err := fmt.Fprintf(RootCmd.Writer, "\t%s", candidate); err != nil {
							return err
						}
					}
					if _, err := fmt.Fprintln(RootCmd.Writer); err != nil {
						return err
					}
				}
				return nil
			},
		}},
	})
}

func newPluginInitCommand() *cli.Command {
	return &cli.Command{
		Name: "init", Usage: "Create a standalone extension project", ArgsUsage: "<name>", HideHelpCommand: true,
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "language", Aliases: []string{"lang"}, Value: "go", Usage: "Starter language: go or python"},
			&cli.StringFlag{Name: "dir", Usage: "New project directory (default: tlego-<name>); parent must exist"},
		},
		Action: func(ctx context.Context, c *cli.Command) error {
			if err := ctx.Err(); err != nil {
				return err
			}
			if c.Args().Len() != 1 {
				return fmt.Errorf("provide one extension name: tlego plugin init <name>")
			}
			name := c.Args().First()
			if hasNativeCommand(name) || name == "help" || name == "version" {
				return fmt.Errorf("extension name %q is reserved by a native command or alias", name)
			}
			path, err := extensions.Init(name, c.String("language"), c.String("dir"))
			if err != nil {
				return err
			}
			_, err = fmt.Fprintf(c.Writer, "Created %s\nSee %s for build, test and PATH setup.\n", path, filepath.Join(path, "README.md"))
			return err
		},
	}
}
