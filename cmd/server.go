package cmd

import (
	"context"
	"os"
	"os/signal"

	"github.com/Mohammed-Ashour/khonsu/pkg/server"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{Name: "server", Aliases: []string{"serve"}, Usage: "Serve the JSON API only (for the web app, run khonsu web)", Flags: []cli.Flag{&cli.StringFlag{Name: "addr", Value: "127.0.0.1:8080", Usage: "HTTP bind address"}, &cli.StringFlag{Name: "static-dir", Usage: "Also serve files from this directory, such as the legacy public/ prototype"}}, Action: startServer})
}
func startServer(ctx context.Context, c *cli.Command) error {
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt)
	defer stop()
	return server.Serve(ctx, c.String("addr"), c.String("static-dir"))
}
