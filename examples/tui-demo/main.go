// tui-demo runs the real TUI against an embedded ISS snapshot without using
// the network or the user's cache/settings. It is intended for documentation.
package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/Mohammed-Ashour/tlego/pkg/tui"
	"github.com/Mohammed-Ashour/tlego/pkg/tui/data"
	tea "github.com/charmbracelet/bubbletea"
)

//go:embed iss.tle
var iss []byte

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

// offlineTransport also blocks accidental requests when exploring beyond the fixture.
type offlineTransport struct{}

func (offlineTransport) RoundTrip(*http.Request) (*http.Response, error) {
	return nil, fmt.Errorf("offline demo: this object or group is not included; use tlego tui for live data")
}

func run() error {
	previousTransport := http.DefaultTransport
	http.DefaultTransport = offlineTransport{}
	defer func() { http.DefaultTransport = previousTransport }()

	dir, err := os.MkdirTemp("", "tlego-demo-")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)
	// This variable is changed only in this standalone example process.
	if err := os.Setenv("XDG_CONFIG_HOME", filepath.Join(dir, "config")); err != nil {
		return err
	}
	cache := filepath.Join(dir, "cache")
	for _, name := range []string{"groups/space_stations.tle", "norad/25544.tle"} {
		path := filepath.Join(cache, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			return err
		}
		if err := os.WriteFile(path, bytes.TrimSpace(iss), 0644); err != nil {
			return err
		}
	}
	settings := tui.DefaultSettings()
	settings.Observer = tui.Observer{Lat: 51.4779, Lon: 0, Alt: 0.046}
	model := tui.NewModel(tui.Options{Group: "Space Stations"}, settings, data.NewStore(cache, 12*time.Hour), nil)
	_, err = tea.NewProgram(model, tea.WithAltScreen()).Run()
	return err
}
