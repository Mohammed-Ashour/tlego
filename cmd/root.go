package cmd

import (
	"context"
	"fmt"

	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/urfave/cli/v3"
)

type Author struct {
	Name    string
	Email   string
	Website string
}

var RootCmd = &cli.Command{
	Name:        "tlego",
	Version:     "v0.0.25",
	UsageText:   "TLE Aggregator and visualizer client",
	Description: "tlego is a simple fast lightweight TLE aggregator and visualizer! built on GO",
	Authors: []any{
		Author{
			Name:    "Mohamed Ashour",
			Email:   "m.aly.ashour@gmail.com",
			Website: "blog.m-ashour.space",
		},
	},
	Commands: []*cli.Command{
		&cli.Command{
			Name:   "hello",
			Action: helloAction,
		},
		&cli.Command{
			Name:   "tle",
			Action: tleGrep,
		},
	},
}

func tleGrep(ctx context.Context, cmd *cli.Command) error {
	args := cmd.Args()
	if args.Len() == 0 {
		fmt.Println("Please provide a NORAD ID for the requested sat")
		return fmt.Errorf("Please provide a NORAD ID for the requested sat")
	}

	noradId := args.First()
	tle, err := celestrak.GetSatelliteTLEByNoradID(noradId)
	if err != nil {
		return err
	}
	fmt.Println(tle)
	return nil
}
func helloAction(ctx context.Context, cmd *cli.Command) error {
	fmt.Println("Helloooo,")
	return nil
}
