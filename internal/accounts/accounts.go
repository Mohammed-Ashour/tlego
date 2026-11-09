// Package accounts stores the optional provider accounts a user connects with
// "khonsu setup". The file is plain text that only its owner can read.
package accounts

import (
	"errors"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// SpaceTrack is a Space-Track.org login.
type SpaceTrack struct {
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// Accounts holds every saved account.
type Accounts struct {
	SpaceTrack *SpaceTrack `yaml:"space_track,omitempty"`
}

// Path returns the accounts file, beside Khonsu's other settings.
func Path() (string, error) {
	if dir := os.Getenv("XDG_CONFIG_HOME"); dir != "" && filepath.IsAbs(dir) {
		return filepath.Join(dir, "khonsu", "accounts.yaml"), nil
	}
	dir, err := os.UserConfigDir()
	if err != nil {
		home, homeErr := os.UserHomeDir()
		if homeErr != nil {
			return "", err
		}
		dir = filepath.Join(home, ".config")
	}
	return filepath.Join(dir, "khonsu", "accounts.yaml"), nil
}

// Load returns the saved accounts, which are empty when no file exists.
func Load() (Accounts, error) {
	path, err := Path()
	if err != nil {
		return Accounts{}, err
	}
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return Accounts{}, nil
	}
	if err != nil {
		return Accounts{}, err
	}
	var saved Accounts
	if err := yaml.Unmarshal(data, &saved); err != nil {
		return Accounts{}, errors.New("the accounts file is not valid YAML")
	}
	return saved, nil
}

// Save replaces the accounts file in one step, readable only by its owner.
func Save(saved Accounts) error {
	path, err := Path()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	data, err := yaml.Marshal(saved)
	if err != nil {
		return err
	}
	// CreateTemp makes the file private before any secret is written to it.
	file, err := os.CreateTemp(filepath.Dir(path), ".accounts-*.yaml")
	if err != nil {
		return err
	}
	defer os.Remove(file.Name())
	_, err = file.Write(data)
	if closeErr := file.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return err
	}
	return os.Rename(file.Name(), path)
}
