package celestrak

import (
	"os"
	"runtime"

	"io"
	"net/http"

	"path/filepath"
	"strings"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	"gopkg.in/yaml.v3"
)

var CELESTRAK_URL = "https://celestrak.org/NORAD/elements/gp.php?CATNR=NORADID&FORMAT=TLE"

// Define the directory where all TLE files will be downloaded
var DOWNLOAD_DIR = "downloads"

type SatelliteGroup struct {
	Name string `yaml:"name"`
	URL  string `yaml:"url"`
}

type CelestrakConfig struct {
	SatelliteGroups []SatelliteGroup `yaml:"satellite_groups"`
	Metadata        struct {
		Source      string `yaml:"source"`
		URL         string `yaml:"url"`
		Format      string `yaml:"format"`
		Provider    string `yaml:"provider"`
		DataSource  string `yaml:"data_source"`
		LastUpdated string `yaml:"last_updated"`
	} `yaml:"metadata"`
}

func GetSatelliteTLEByNoradID(noradID string) (tle.TLE, error) {
	url := strings.Replace(CELESTRAK_URL, "NORADID", noradID, 1)
	filename := filepath.Join(DOWNLOAD_DIR, noradID+".tle")
	tles, err := DownloadTLEs(url, filename)
	if err != nil {
		return tle.TLE{}, err
	}
	return tles[0], nil
}

func GetSatelliteGroupTLEs(groupName string, config CelestrakConfig) ([]tle.TLE, error) {
	for _, group := range config.SatelliteGroups {
		if group.Name == groupName {
			filename := filepath.Join(DOWNLOAD_DIR, groupName+".tle")
			return DownloadTLEs(group.URL, filename)
		}
	}
	return []tle.TLE{}, nil
}

func DownloadTLEs(url string, filename string) ([]tle.TLE, error) {
	// Ensure the download directory exists
	err := ensureDownloadDir()
	if err != nil {
		return []tle.TLE{}, err
	}

	// Fetch the TLE data from the URL
	resp, err := http.Get(url)
	if err != nil {
		return []tle.TLE{}, err
	}
	defer resp.Body.Close()
	file, err := os.Create(filename)
	if err != nil {
		logger.Error("Failed to create file", "error", err)
		return []tle.TLE{}, err
	}
	defer file.Close()
	_, err = io.Copy(file, resp.Body)
	if err != nil {
		logger.Error("Error writing to file", "error", err)
		return []tle.TLE{}, err
	}

	tles, err := tle.ReadTLEFile(filename)
	if err != nil {
		logger.Error("Failed to read TLE file", "error", err)
		return []tle.TLE{}, err
	}
	return tles, nil
}

func ReadCelestrakConfig() (CelestrakConfig, error) {
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		panic("Could not get current file path")
	}

	currentDir := filepath.Dir(currentFile)
	fp := filepath.Join(currentDir, "satellite_groups.yaml")

	logger.Info("Reading file", "file", fp)
	data, err := os.ReadFile(fp)
	if err != nil {
		return CelestrakConfig{}, err
	}
	var config CelestrakConfig
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		logger.Error("Failed to unmarshal yaml", "error", err)
		return CelestrakConfig{}, err
	}
	return config, nil
}

// ensureDownloadDir ensures that the download directory exists
func ensureDownloadDir() error {
	if _, err := os.Stat(DOWNLOAD_DIR); os.IsNotExist(err) {
		logger.Info("Creating download directory", "dir", DOWNLOAD_DIR)
		err := os.MkdirAll(DOWNLOAD_DIR, os.ModePerm)
		if err != nil {
			logger.Error("Failed to create download directory", "error", err)
			return err
		}
	}
	return nil
}
