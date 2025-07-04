package cmd

import (
	"github.com/urfave/cli/v3"
	"github.com/Mohammed-Ashour/tlego/pkg/server"
)

var ServerCmd = &cli.Command{
	Name:    "server",
	Usage:   "Launch the satellite visualization web server",
	Aliases: []string{"serve"},
	Action: func(ctx *cli.Context) error {
		server.StartServer()
		return nil
	},
}
