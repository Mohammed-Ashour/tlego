package cmd

import (
	"context"

	"github.com/Mohammed-Ashour/tlego/pkg/tui"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:        "tui",
		Usage:       "tlego tui",
		Description: "Launch the terminal UI.",
		Category:    "UI",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:  "screen",
				Usage: "Start on a specific screen (Home, Explore, Detail, Track, Predict, Reports, Settings)",
			},
			&cli.StringFlag{
				Name:  "norad",
				Usage: "Open the satellite detail view for a NORAD ID",
			},
			&cli.StringFlag{
				Name:  "group",
				Usage: "Open Explore with a group filter",
			},
			&cli.StringFlag{
				Name:  "track",
				Usage: "Open Track view for a NORAD ID",
			},
		},
		Action: tuiAction,
	})
}

func tuiAction(ctx context.Context, cmd *cli.Command) error {
	noradID := cmd.String("norad")
	trackID := cmd.String("track")
	if noradID != "" {
		if err := validateNoradID(noradID); err != nil {
			return err
		}
	}
	if trackID != "" {
		if err := validateNoradID(trackID); err != nil {
			return err
		}
	}
	return tui.RunContext(ctx, tui.Options{
		Screen:     cmd.String("screen"),
		NoradID:    noradID,
		Group:      cmd.String("group"),
		TrackNorad: trackID,
	})
}
