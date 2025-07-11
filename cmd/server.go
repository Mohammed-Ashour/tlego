package cmd

import (
	"context"

	"github.com/Mohammed-Ashour/tlego/pkg/server"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{
		Name:    "server",
		Usage:   "Launch the satellite visualization web server. Example: tlego server",
		Aliases: []string{"serve"},
		Action:  startServer,
	})
}

func startServer(ctx context.Context, cmd *cli.Command) error {
	server.StartServer()
	return nil
}
