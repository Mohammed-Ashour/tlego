package server

import (
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	satelliteTLE "github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
)

func TestVersionedPositionAndInvalidIDWithoutNetwork(t *testing.T) {
	cache := t.TempDir()
	if err := os.MkdirAll(filepath.Join(cache, "norad"), 0755); err != nil {
		t.Fatal(err)
	}
	elements, err := os.ReadFile("../../examples/tui-demo/iss.tle")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(cache, "norad", "25544.tle"), elements, 0644); err != nil {
		t.Fatal(err)
	}
	handler := newHandler(catalog.NewStore(cache, 0))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest("GET", "/api/v1/position?norad_id=25544&time=2026-10-24T05:01:11Z", nil))
	if recorder.Code != http.StatusOK {
		t.Fatal(recorder.Code, recorder.Body.String())
	}
	var result struct {
		SchemaVersion string                `json:"schema_version"`
		Kind          string                `json:"kind"`
		Data          output.PositionRecord `json:"data"`
		Provenance    output.Provenance     `json:"provenance"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	records, err := catalog.ParseTLE(elements)
	if err != nil {
		t.Fatal(err)
	}
	instant := time.Date(2026, 10, 24, 5, 1, 11, 0, time.UTC)
	want := output.PositionV1("25544", orbit.At(satellite.NewSatelliteFromTLE(records[0], satellite.GravityWGS84), instant))
	if result.Data != want || result.SchemaVersion != "1.0" || result.Kind != "position" || result.Provenance.CacheStatus != "fresh" {
		t.Fatalf("unexpected response: %+v", result)
	}
	for _, route := range []string{"/api/location", "/api/v1/position"} {
		r := httptest.NewRecorder()
		handler.ServeHTTP(r, httptest.NewRequest("GET", route+"?norad_id=..%2Fescape", nil))
		if r.Code != http.StatusBadRequest {
			t.Fatalf("%s invalid ID returned %d", route, r.Code)
		}
	}
}

func TestLocationResponsePreservesJSONShapeAndCoreUnits(t *testing.T) {
	const line1 = "1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927"
	const line2 = "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537"
	tleData, err := satelliteTLE.ParseTLE(line1, line2, "ISS (ZARYA)")
	if err != nil {
		t.Fatalf("ParseTLE(): %v", err)
	}
	now := time.Date(2008, 9, 22, 1, 13, 14, 789000000, time.FixedZone("UTC+3", 3*60*60))
	response := locationResponse(tleData, now)

	encoded, err := json.Marshal(response)
	if err != nil {
		t.Fatalf("Marshal response: %v", err)
	}
	var decoded map[string]json.RawMessage
	if err := json.Unmarshal(encoded, &decoded); err != nil {
		t.Fatalf("Unmarshal response: %v", err)
	}
	for _, key := range []string{"name", "eci", "info", "tle"} {
		if _, ok := decoded[key]; !ok {
			t.Errorf("response missing top-level %q", key)
		}
	}
	if len(decoded) != 4 {
		t.Errorf("response has %d top-level fields, want exactly name/eci/info/tle", len(decoded))
	}

	var eci, info map[string]float64
	if err := json.Unmarshal(decoded["eci"], &eci); err != nil {
		t.Fatalf("decode eci: %v", err)
	}
	if err := json.Unmarshal(decoded["info"], &info); err != nil {
		t.Fatalf("decode info: %v", err)
	}
	for _, key := range []string{"x", "y", "z"} {
		if _, ok := eci[key]; !ok {
			t.Errorf("eci missing %q", key)
		}
	}
	for _, key := range []string{"latitude", "longitude", "altitude"} {
		if _, ok := info[key]; !ok {
			t.Errorf("info missing %q", key)
		}
	}
	if len(eci) != 3 || len(info) != 3 {
		t.Fatalf("unexpected nested shape: eci=%v info=%v", eci, info)
	}

	sat := satellite.NewSatelliteFromTLE(tleData, satellite.GravityWGS84)
	want := orbit.At(sat, now)
	for key, got := range eci {
		var expected float64
		switch key {
		case "x":
			expected = want.PositionTEMEKm.X
		case "y":
			expected = want.PositionTEMEKm.Y
		case "z":
			expected = want.PositionTEMEKm.Z
		}
		assertClose(t, "eci."+key, got, expected)
	}
	assertClose(t, "info.latitude (degrees)", info["latitude"], want.LatDeg)
	assertClose(t, "info.longitude (degrees)", info["longitude"], want.LonDeg)
	assertClose(t, "info.altitude (km)", info["altitude"], want.AltKm)
	if info["latitude"] < -90 || info["latitude"] > 90 || info["longitude"] < -180 || info["longitude"] >= 180 {
		t.Errorf("HTTP geographic values are not degrees in expected ranges: %v", info)
	}

	var tleFields map[string]string
	if err := json.Unmarshal(decoded["tle"], &tleFields); err != nil {
		t.Fatalf("decode tle: %v", err)
	}
	if len(tleFields) != 2 || tleFields["line1"] != line1 || tleFields["line2"] != line2 {
		t.Errorf("tle = %v, want unchanged line1/line2 values", tleFields)
	}
	var name string
	if err := json.Unmarshal(decoded["name"], &name); err != nil || name != "ISS (ZARYA)" {
		t.Errorf("name = %q, error %v; want ISS (ZARYA)", name, err)
	}
}

func assertClose(t *testing.T, label string, got, want float64) {
	t.Helper()
	if math.IsNaN(got) || math.IsInf(got, 0) || math.Abs(got-want) > 1e-9 {
		t.Errorf("%s = %.12f, want %.12f", label, got, want)
	}
}
