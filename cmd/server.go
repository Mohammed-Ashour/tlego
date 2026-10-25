package cmd

import (
	"context"
	"os"
	"os/signal"

	"github.com/Mohammed-Ashour/tlego/pkg/server"
	"github.com/urfave/cli/v3"
)

func init() {
	RootCmd.Commands = append(RootCmd.Commands, &cli.Command{Name: "server", Aliases: []string{"serve"}, Usage: "Serve the HTTP API and experimental web UI", Flags: []cli.Flag{&cli.StringFlag{Name: "addr", Value: "127.0.0.1:8080", Usage: "HTTP bind address"}, &cli.StringFlag{Name: "static-dir", Value: "public", Usage: "Static UI directory; empty disables static files"}}, Action: startServer})
}
func startServer(ctx context.Context, c *cli.Command) error {
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt)
	defer stop()
	return server.Serve(ctx, c.String("addr"), c.String("static-dir"))
}
