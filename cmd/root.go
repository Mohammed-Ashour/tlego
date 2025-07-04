package cmd

import (
	"github.com/urfave/cli/v3"
)

type Author struct {
	Name    string
	Email   string
	Website string
}

var RootCmd = &cli.Command{
	Name:        "tlego",
	Version:     "v1.1",
	Usage:       "A TLE client",
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
		ServerCmd,
	},
}
