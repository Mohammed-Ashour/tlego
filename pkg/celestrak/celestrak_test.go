package celestrak

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

const testTLE = `ISS (ZARYA)
1 25544U 98067A   24057.91666667  .00000000  00000+0  00000+0 0    04
2 25544  51.6416 247.4627 0006946 130.5360 325.0288 15.49140836    00
`

func setupTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	previousDir, previousURL := DOWNLOAD_DIR, CELESTRAK_URL
	DOWNLOAD_DIR = t.TempDir()
	t.Cleanup(func() { DOWNLOAD_DIR, CELESTRAK_URL = previousDir, previousURL })
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("fail") == "1" {
			http.Error(w, "unavailable", http.StatusServiceUnavailable)
			return
		}
		w.Write([]byte(testTLE))
	}))
	t.Cleanup(server.Close)
	return server
}

func TestDownloadTLEsKeepsValidCacheWhenRefreshFails(t *testing.T) {
	server := setupTestServer(t)
	path := filepath.Join(DOWNLOAD_DIR, "cached.tle")
	if err := os.WriteFile(path, []byte(testTLE), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.Chtimes(path, time.Now().Add(-time.Hour), time.Now().Add(-time.Hour)); err != nil {
		t.Fatal(err)
	}
	tles, err := DownloadTLEs(server.URL+"?fail=1", path)
	if err != nil || len(tles) != 1 {
		t.Fatalf("stale fallback = (%d TLEs, %v)", len(tles), err)
	}
	contents, err := os.ReadFile(path)
	if err != nil || string(contents) != testTLE {
		t.Fatalf("known-good cache changed: err=%v", err)
	}
}

func TestGetSatelliteTLEByNoradID(t *testing.T) {
	// Setup test server
	server := setupTestServer(t)
	// Override celestrak URL for testing
	CELESTRAK_URL = server.URL + "?CATNR=NORADID&FORMAT=TLE"

	// Test TLE download
	tle, err := GetSatelliteTLEByNoradID("25544")
	if err != nil {
		t.Errorf("GetSatelliteTLEByNoradID() error = %v", err)
		return
	}

	if tle.Name != "ISS (ZARYA)" {
		t.Errorf("Expected ISS (ZARYA), got %s", tle.Name)
	}
}

func TestGetSatelliteGroupTLEs(t *testing.T) {
	// Setup test server
	server := setupTestServer(t)

	// Create temporary config with test server URL

	tempConfig := CelestrakConfig{
		SatelliteGroups: []SatelliteGroup{
			{Name: "TestGroup",
				URL: server.URL,
			},
		},
	}

	// Test group TLEs download
	tles, err := GetSatelliteGroupTLEs("TestGroup", tempConfig)
	if err != nil {
		t.Errorf("GetSatelliteGroupTLEs() error = %v", err)
		return
	}

	if len(tles) != 1 {
		t.Errorf("Expected 1 TLE, got %d", len(tles))
	}
}

func TestDownloadTLEs(t *testing.T) {
	// Setup test server
	server := setupTestServer(t)

	// Test TLE download
	path := filepath.Join(DOWNLOAD_DIR, "test.tle")
	tles, err := DownloadTLEs(server.URL, path)
	if err != nil {
		t.Errorf("DownloadTLEs() error = %v", err)
		return
	}

	if len(tles) != 1 {
		t.Errorf("Expected 1 TLE, got %d", len(tles))
	}

	// Test error cases
	_, err = DownloadTLEs("invalid-url", filepath.Join(DOWNLOAD_DIR, "invalid.tle"))
	if err == nil {
		t.Error("Expected error for invalid URL")
	}
}
