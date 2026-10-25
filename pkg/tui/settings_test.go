package tui

import (
	"math"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestSettingsValidateRejectsInvalidValues(t *testing.T) {
	tooLargeSeconds := int(int64(math.MaxInt64/int64(time.Second)) + 1)
	tests := []struct {
		name string
		edit func(*Settings)
	}{
		{"refresh", func(s *Settings) { s.RefreshSeconds = 0 }},
		{"cache ttl", func(s *Settings) { s.CacheTTLSeconds = -1 }},
		{"latitude range", func(s *Settings) { s.Observer.Lat = 91 }},
		{"longitude range", func(s *Settings) { s.Observer.Lon = -181 }},
		{"non-finite altitude", func(s *Settings) { s.Observer.Alt = math.Inf(1) }},
		{"altitude below earth", func(s *Settings) { s.Observer.Alt = -earthRadiusKm }},
		{"unknown map provider", func(s *Settings) { s.MapProvider = "unknown" }},
		{"refresh overflow", func(s *Settings) { s.RefreshSeconds = tooLargeSeconds }},
		{"cache ttl overflow", func(s *Settings) { s.CacheTTLSeconds = tooLargeSeconds }},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			settings := DefaultSettings()
			if strings.Contains(tt.name, "overflow") && strconv.IntSize < 64 {
				t.Skip("int cannot represent a duration overflow on this architecture")
			}
			tt.edit(&settings)
			if err := settings.Validate(); err == nil {
				t.Fatal("Validate() succeeded for invalid settings")
			}
		})
	}
}

func TestSaveSettingsRejectsInvalidValuesWithoutChangingExistingFile(t *testing.T) {
	config := t.TempDir()
	t.Setenv("XDG_CONFIG_HOME", config)
	path := filepath.Join(config, "tlego", "tui.yaml")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	original := []byte("existing settings\n")
	if err := os.WriteFile(path, original, 0o600); err != nil {
		t.Fatal(err)
	}
	settings := DefaultSettings()
	settings.Observer.Lat = 100
	if err := SaveSettings(settings); err == nil {
		t.Fatal("SaveSettings() succeeded for invalid settings")
	}
	got, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != string(original) {
		t.Fatalf("existing settings changed: %q", got)
	}
}

func TestSaveSettingsWritesLoadableSettings(t *testing.T) {
	config := t.TempDir()
	t.Setenv("XDG_CONFIG_HOME", config)
	want := DefaultSettings()
	want.Observer = Observer{Lat: 49.6, Lon: 6.1, Alt: 0.2}
	want.Recent = []string{"25544"}
	if err := SaveSettings(want); err != nil {
		t.Fatal(err)
	}
	got, err := LoadSettings()
	if err != nil {
		t.Fatal(err)
	}
	if got.Observer != want.Observer || got.Recent[0] != want.Recent[0] {
		t.Fatalf("LoadSettings() = %+v, want observer/recent from %+v", got, want)
	}
	entries, err := os.ReadDir(filepath.Join(config, "tlego"))
	if err != nil {
		t.Fatal(err)
	}
	for _, entry := range entries {
		if strings.HasPrefix(entry.Name(), ".tui-settings-") {
			t.Fatalf("temporary settings file was left behind: %s", entry.Name())
		}
	}
}

func TestLoadSettingsReturnsDefaultsForInvalidSettings(t *testing.T) {
	config := t.TempDir()
	t.Setenv("XDG_CONFIG_HOME", config)
	path := filepath.Join(config, "tlego", "tui.yaml")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte("observer:\n  lat: 100\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	got, err := LoadSettings()
	if err == nil {
		t.Fatal("LoadSettings() succeeded for invalid settings")
	}
	if !reflect.DeepEqual(got, DefaultSettings()) {
		t.Fatalf("LoadSettings() returned %+v with error; want defaults %+v", got, DefaultSettings())
	}
}
