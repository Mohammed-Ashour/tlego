package cmd

import (
	"context"
	"fmt"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"strings"
	"syscall"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
	"github.com/Mohammed-Ashour/khonsu/internal/elements"
	"github.com/Mohammed-Ashour/khonsu/internal/webui"
	"github.com/Mohammed-Ashour/khonsu/pkg/server"
	"github.com/urfave/cli/v3"
)

// openBrowser is replaced in tests, so they never launch a real browser.
var openBrowser = func(url string) error {
	var command *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		command = exec.Command("open", url)
	case "windows":
		command = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		command = exec.Command("xdg-open", url)
	}
	if err := command.Start(); err != nil {
		return err
	}
	go func() { _ = command.Wait() }() // Reap it, so no zombie outlives the launcher.
	return nil
}

func init() { RootCmd.Commands = append(RootCmd.Commands, newWebCommand()) }

func newWebCommand() *cli.Command {
	flags := append(cacheFlags(),
		&cli.StringFlag{Name: "addr", Value: "127.0.0.1:8080", Usage: "HTTP bind address; port 0 picks a free port"},
		&cli.StringFlag{Name: "file", Usage: "Serve satellites from a local TLE or GP JSON file instead of live data"},
		&cli.BoolFlag{Name: "no-open", Usage: "Do not open a browser"},
	)
	return &cli.Command{Name: "web", Usage: "Open the web app: a 3D globe, orbit explanations and viewing windows", Category: "UI", Flags: flags, Action: startWeb}
}

func startWeb(ctx context.Context, c *cli.Command) error {
	var records []elements.Record
	if file := c.String("file"); file != "" {
		var err error
		records, err = catalog.ReadElements(file)
		if err != nil {
			return err
		}
	}
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()
	ttl := c.Duration("cache-ttl")
	return server.ServeApp(ctx, server.AppOptions{
		Addr: c.String("addr"), UI: webui.FS(), Records: records, CacheDir: c.String("cache-dir"), CacheTTL: ttl,
		OnReady: func(url string) {
			fmt.Fprintf(c.Writer, "Khonsu is running at %s\nPress Ctrl+C to stop.\n", url)
			if !isLoopback(c.String("addr")) {
				fmt.Fprintln(c.ErrWriter, "Warning: this address may be reachable from other machines. The server has no authentication, and every visitor can trigger provider requests.")
			}
			if !c.Bool("no-open") {
				if err := openBrowser(url); err != nil {
					fmt.Fprintf(c.ErrWriter, "Could not open a browser: %v\n", err)
				}
			}
		},
	})
}

func isLoopback(addr string) bool {
	host, _, err := net.SplitHostPort(addr)
	if err != nil {
		return false
	}
	if strings.EqualFold(host, "localhost") {
		return true
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}
