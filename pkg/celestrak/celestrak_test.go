package celestrak

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

const testConfig = `
satellite_groups:
  - name: "Starlink"
    url: "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle"
  - name: "ISS"
    url: "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle"
metadata:
  source: "CelesTrak"
  url: "https://celestrak.org"
  format: "TLE"
  provider: "Space-Track"
  data_source: "GP data"
  last_updated: "2024-02-26"
`

const testTLE = `ISS (ZARYA)
1 25544U 98067A   24057.91666667  .00000000  00000+0  00000+0 0    04
2 25544  51.6416 247.4627 0006946 130.5360 325.0288 15.49140836    00
`

func setupTestServer() *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(testTLE))
	}))
}

func TestReadCelestrakConfig(t *testing.T) {

	// Test config reading
	config, err := ReadCelestrakConfig()
	if err != nil {
		t.Errorf("ReadCelestrakConfig() error = %v", err)
		return
	}

	// Verify config contents
	if len(config.SatelliteGroups) != 44 {
		t.Errorf("Expected 44 satellite groups, got %d", len(config.SatelliteGroups))
	}

}

func TestGetSatelliteTLEByNoradID(t *testing.T) {
	// Setup test server
	server := setupTestServer()
	defer server.Close()
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
	server := setupTestServer()
	defer server.Close()

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
	server := setupTestServer()
	defer server.Close()

	// Test TLE download
	tles, err := DownloadTLEs(server.URL, "test.tle")
	if err != nil {
		t.Errorf("DownloadTLEs() error = %v", err)
		return
	}

	if len(tles) != 1 {
		t.Errorf("Expected 1 TLE, got %d", len(tles))
	}

	// Test error cases
	_, err = DownloadTLEs("invalid-url", "test.tle")
	if err == nil {
		t.Error("Expected error for invalid URL")
	}
}
