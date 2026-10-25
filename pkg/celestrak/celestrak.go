package celestrak

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
)

// These variables remain mutable for compatibility with existing callers.
var CELESTRAK_URL = catalog.CelestrakURL
var DOWNLOAD_DIR = "downloads"

type SatelliteGroup = catalog.SatelliteGroup
type CelestrakConfig = catalog.CelestrakConfig

func GetSatelliteTLEByNoradID(noradID string) (tle.TLE, error) {
	if err := catalog.ValidateNoradID(noradID); err != nil {
		return tle.TLE{}, err
	}
	store := catalog.NewStore(DOWNLOAD_DIR, -time.Nanosecond)
	url := strings.Replace(CELESTRAK_URL, "NORADID", noradID, 1)
	tles, _, err := store.DownloadToPath(context.Background(), url, filepath.Join(DOWNLOAD_DIR, noradID+".tle"), noradID)
	if err != nil {
		return tle.TLE{}, err
	}
	if len(tles) == 0 {
		return tle.TLE{}, fmt.Errorf("no TLEs found for NORAD ID %s", noradID)
	}
	return tles[0], nil
}

func GetSatelliteGroupTLEs(groupName string, config CelestrakConfig) ([]tle.TLE, error) {
	var group *SatelliteGroup
	for i := range config.SatelliteGroups {
		if strings.EqualFold(config.SatelliteGroups[i].Name, groupName) {
			group = &config.SatelliteGroups[i]
			break
		}
	}
	if group == nil {
		return nil, fmt.Errorf("unknown satellite group: %s", groupName)
	}
	store := catalog.NewStore(DOWNLOAD_DIR, -time.Nanosecond)
	path := filepath.Join(DOWNLOAD_DIR, group.Name+".tle")
	tles, _, err := store.DownloadToPath(context.Background(), group.URL, path, "")
	return tles, err
}

func DownloadTLEs(url, filename string) ([]tle.TLE, error) {
	store := catalog.NewStore(filepath.Dir(filename), -time.Nanosecond)
	tles, _, err := store.DownloadToPath(context.Background(), url, filename, "")
	return tles, err
}

func ReadCelestrakConfig() (CelestrakConfig, error) { return catalog.ReadCelestrakConfig() }

func ensureDownloadDir() error { return os.MkdirAll(DOWNLOAD_DIR, 0o755) }
