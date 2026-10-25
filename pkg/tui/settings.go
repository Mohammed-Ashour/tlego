package tui

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

type Observer struct {
	Lat float64 `yaml:"lat"`
	Lon float64 `yaml:"lon"`
	Alt float64 `yaml:"alt"`
}

type Settings struct {
	RefreshSeconds  int      `yaml:"refresh_seconds"`
	CacheTTLSeconds int      `yaml:"cache_ttl_seconds"`
	Observer        Observer `yaml:"observer"`
	MapProvider     string   `yaml:"map_provider"`
	Theme           string   `yaml:"theme"`
	Recent          []string `yaml:"recent"`
}

func DefaultSettings() Settings {
	return Settings{
		RefreshSeconds:  2,
		CacheTTLSeconds: 12 * 60 * 60,
		Observer: Observer{
			Lat: 0,
			Lon: 0,
			Alt: 0,
		},
		MapProvider: "google",
		Theme:       "default",
		Recent:      []string{},
	}
}

func (s Settings) RefreshInterval() time.Duration {
	if s.RefreshSeconds <= 0 {
		return 2 * time.Second
	}
	return time.Duration(s.RefreshSeconds) * time.Second
}

func (s Settings) CacheTTL() time.Duration {
	if s.CacheTTLSeconds <= 0 {
		return 12 * time.Hour
	}
	return time.Duration(s.CacheTTLSeconds) * time.Second
}

func LoadSettings() (Settings, error) {
	path, err := settingsPath()
	if err != nil {
		return DefaultSettings(), err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return DefaultSettings(), nil
		}
		return DefaultSettings(), err
	}
	settings := DefaultSettings()
	if err := yaml.Unmarshal(data, &settings); err != nil {
		return DefaultSettings(), err
	}
	if err := settings.Validate(); err != nil {
		return DefaultSettings(), err
	}
	return settings, nil
}

func SaveSettings(settings Settings) error {
	if err := settings.Validate(); err != nil {
		return err
	}
	path, err := settingsPath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	data, err := yaml.Marshal(settings)
	if err != nil {
		return err
	}
	temp, err := os.CreateTemp(filepath.Dir(path), ".tui-settings-*.yaml")
	if err != nil {
		return err
	}
	tempPath := temp.Name()
	defer os.Remove(tempPath)
	if err := temp.Chmod(0o644); err != nil {
		temp.Close()
		return err
	}
	if _, err := temp.Write(data); err != nil {
		temp.Close()
		return err
	}
	if err := temp.Sync(); err != nil {
		temp.Close()
		return err
	}
	if err := temp.Close(); err != nil {
		return err
	}
	return os.Rename(tempPath, path)
}

// Validate checks settings that would otherwise lead to invalid timing or
// observer coordinates in the TUI.
func (s Settings) Validate() error {
	if s.RefreshSeconds <= 0 {
		return fmt.Errorf("refresh_seconds must be greater than zero")
	}
	if int64(s.RefreshSeconds) > int64(math.MaxInt64/int64(time.Second)) {
		return fmt.Errorf("refresh_seconds is too large")
	}
	if s.CacheTTLSeconds <= 0 {
		return fmt.Errorf("cache_ttl_seconds must be greater than zero")
	}
	if int64(s.CacheTTLSeconds) > int64(math.MaxInt64/int64(time.Second)) {
		return fmt.Errorf("cache_ttl_seconds is too large")
	}
	if math.IsNaN(s.Observer.Lat) || math.IsInf(s.Observer.Lat, 0) || s.Observer.Lat < -90 || s.Observer.Lat > 90 {
		return fmt.Errorf("observer latitude must be finite and between -90 and 90 degrees")
	}
	if math.IsNaN(s.Observer.Lon) || math.IsInf(s.Observer.Lon, 0) || s.Observer.Lon < -180 || s.Observer.Lon > 180 {
		return fmt.Errorf("observer longitude must be finite and between -180 and 180 degrees")
	}
	if math.IsNaN(s.Observer.Alt) || math.IsInf(s.Observer.Alt, 0) || s.Observer.Alt <= -earthRadiusKm {
		return fmt.Errorf("observer altitude must be finite and greater than -%.3f km", earthRadiusKm)
	}
	switch strings.ToLower(s.MapProvider) {
	case "", "google", "osm", "openstreetmap":
	default:
		return fmt.Errorf("map_provider must be google, osm, or openstreetmap")
	}
	return nil
}

func settingsPath() (string, error) {
	if dir := os.Getenv("XDG_CONFIG_HOME"); dir != "" && filepath.IsAbs(dir) {
		return filepath.Join(dir, "tlego", "tui.yaml"), nil
	}
	dir, err := os.UserConfigDir()
	if err != nil {
		home, herr := os.UserHomeDir()
		if herr != nil {
			return "", err
		}
		dir = filepath.Join(home, ".config")
	}
	return filepath.Join(dir, "tlego", "tui.yaml"), nil
}
