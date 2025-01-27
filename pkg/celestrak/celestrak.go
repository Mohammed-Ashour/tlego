package celestrak

import (
	"fmt"
	"os"
	"runtime"

	"io"
	"net/http"

	"path/filepath"
	"strings"

	"github.com/Mohammed-Ashour/tlego/pkg/logger"
	"github.com/Mohammed-Ashour/tlego/pkg/tle"
	"gopkg.in/yaml.v3"
)

const CELESTRAK_URL = "https://celestrak.org/NORAD/elements/gp.php?CATNR=NORADID&FORMAT=TLE"

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
	tles, err := DownloadTLEs(url, noradID+".tle")
	if err != nil {
		return tle.TLE{}, err
	}
	return tles[0], nil
}

func GetSatelliteGroupTLEs(groupName string) ([]tle.TLE, error) {
	groups, err := ReadCelestrakConfig()
	if err != nil {
		return []tle.TLE{}, err
	}
	fmt.Println(groups)
	for _, group := range groups.SatelliteGroups {
		if group.Name == groupName {
			return DownloadTLEs(group.URL, groupName+".tle")
		}
	}
	return []tle.TLE{}, nil
}

func DownloadTLEs(url string, filename string) ([]tle.TLE, error) {
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
		logger.Error("Error writing to file: %v\n", "error", err)
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
