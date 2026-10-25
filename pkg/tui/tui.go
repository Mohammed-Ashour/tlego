package tui

import (
	"context"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	tea "github.com/charmbracelet/bubbletea"
)

type Options struct {
	Screen     string
	NoradID    string
	Group      string
	TrackNorad string
}

func Run(opts Options) error { return RunContext(context.Background(), opts) }

func RunContext(ctx context.Context, opts Options) error {
	settings, settingsErr := LoadSettings()
	if settingsErr != nil {
		settings = DefaultSettings()
	}
	cacheDir, _ := catalog.DefaultCacheDir()
	store := catalog.NewStore(cacheDir, settings.CacheTTL())
	model := NewModel(opts, settings, store, settingsErr)
	p := tea.NewProgram(model, tea.WithAltScreen(), tea.WithContext(ctx))
	_, err := p.Run()
	return err
}
