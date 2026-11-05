package server

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
)

func appHandler(t *testing.T) http.Handler {
	t.Helper()
	records, err := catalog.ReadElements("../../examples/tui-demo/iss.tle")
	if err != nil {
		t.Fatal(err)
	}
	ui := fstest.MapFS{"index.html": {Data: []byte("<html>app</html>")}}
	return NewAppHandler(fileSource{records}, ui)
}

func request(t *testing.T, handler http.Handler, path string) (int, map[string]any) {
	t.Helper()
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, path, nil))
	var body map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("%s: %v: %q", path, err, recorder.Body.String())
	}
	return recorder.Code, body
}

const greenwich = "&lat=51.48&lon=0"

func TestPassesEndpointMatchesCLIRecord(t *testing.T) {
	status, body := request(t, appHandler(t), "/api/v1/passes?norad_id=25544&start=2026-10-24T05:01:11Z&duration=24h&step=1m"+greenwich)
	if status != http.StatusOK || body["kind"] != "passes" {
		t.Fatalf("%d %v", status, body)
	}
	data := body["data"].(map[string]any)
	passes := data["passes"].([]any)
	if len(passes) != 6 {
		t.Fatalf("got %d passes", len(passes))
	}
	first := passes[0].(map[string]any)
	if first["start"] != "2026-10-24T05:19:16Z" || first["maximum_at"] != "2026-10-24T05:24:46Z" {
		t.Fatalf("first pass = %v", first)
	}
	if provenance := body["provenance"].(map[string]any); provenance["source"] != "file" || provenance["cache_status"] != "none" || provenance["fetched_at"] != nil {
		t.Fatalf("provenance = %v", provenance)
	}
}

func TestEndpointsRejectBadInput(t *testing.T) {
	handler := appHandler(t)
	for _, path := range []string{
		"/api/v1/passes?norad_id=abc" + greenwich,
		"/api/v1/passes?norad_id=25544",
		"/api/v1/passes?norad_id=25544&lat=91&lon=0",
		"/api/v1/passes?norad_id=25544&lat=x&lon=0",
		"/api/v1/passes?norad_id=25544&start=yesterday" + greenwich,
		"/api/v1/passes?norad_id=25544&duration=720h" + greenwich,
		"/api/v1/passes?norad_id=25544&step=500ms" + greenwich,
		"/api/v1/passes?norad_id=25544&duration=168h&step=1s" + greenwich,
		"/api/v1/tonight?norad_id=25544&min_elevation=95" + greenwich,
		"/api/v1/tonight?norad_id=25544&max_sun_elevation=5" + greenwich,
		"/api/v1/track?norad_id=25544&duration=168h&step=1s",
		"/api/v1/track?norad_id=25544&lat=51",
		"/api/v1/look?norad_id=25544&start=2026-10-24T05:00:00Z&end=2026-10-24T04:00:00Z" + greenwich,
		"/api/v1/look?norad_id=25544&start=2026-10-24T05:00:00Z&end=2026-10-24T06:00:00Z&samples=1" + greenwich,
		"/api/v1/look?norad_id=25544&start=2026-10-24T05:00:00Z&end=2026-10-24T06:00:00Z&samples=5000" + greenwich,
		"/api/v1/search",
		"/api/v1/report?norad_id=25544&time=soon",
	} {
		status, body := request(t, handler, path)
		if status != http.StatusBadRequest || body["kind"] != "error" {
			t.Errorf("%s: %d %v", path, status, body)
		}
	}
}

func TestUnknownLocalSatelliteIsNotFound(t *testing.T) {
	if status, _ := request(t, appHandler(t), "/api/v1/report?norad_id=999"); status != http.StatusNotFound {
		t.Fatalf("status = %d", status)
	}
}

func TestTonightEndpoint(t *testing.T) {
	status, body := request(t, appHandler(t), "/api/v1/tonight?norad_id=25544&time=2026-10-24T12:00:00Z"+greenwich)
	if status != http.StatusOK || body["kind"] != "tonight" {
		t.Fatalf("%d %v", status, body)
	}
	data := body["data"].(map[string]any)
	if len(data["passes"].([]any)) != 1 || data["dark_start"] == nil {
		t.Fatalf("data = %v", data)
	}
	status, body = request(t, appHandler(t), "/api/v1/tonight?norad_id=25544&time=2026-06-21T00:00:00Z&lat=78&lon=15")
	if status != http.StatusOK || body["data"].(map[string]any)["dark_start"] != nil {
		t.Fatalf("midnight sun: %d %v", status, body)
	}
}

func TestTrackEndpointIncludesObserverOnlyWhenAsked(t *testing.T) {
	handler := appHandler(t)
	path := "/api/v1/track?norad_id=25544&start=2026-10-24T05:00:00Z&duration=1h&step=60s"
	status, body := request(t, handler, path)
	if status != http.StatusOK || body["kind"] != "track" {
		t.Fatalf("%d %v", status, body)
	}
	data := body["data"].(map[string]any)
	samples := data["samples"].([]any)
	if len(samples) != 61 || data["frame"] != "TEME" || data["period_minutes"].(float64) < 90 {
		t.Fatalf("samples=%d data frame=%v period=%v", len(samples), data["frame"], data["period_minutes"])
	}
	if _, present := samples[0].(map[string]any)["elevation_deg"]; present {
		t.Fatal("elevation present without an observer")
	}
	if data["sun_km"].(map[string]any)["x"] == 0.0 {
		t.Fatal("missing Sun vector")
	}
	_, body = request(t, handler, path+greenwich)
	sample := body["data"].(map[string]any)["samples"].([]any)[0].(map[string]any)
	if _, present := sample["elevation_deg"]; !present {
		t.Fatalf("sample = %v", sample)
	}
}

func TestLookEndpointSpansWindow(t *testing.T) {
	status, body := request(t, appHandler(t), "/api/v1/look?norad_id=25544&start=2026-10-24T05:19:16Z&end=2026-10-24T05:30:17Z&samples=8"+greenwich)
	if status != http.StatusOK {
		t.Fatalf("%d %v", status, body)
	}
	points := body["data"].(map[string]any)["points"].([]any)
	if len(points) != 8 || points[0].(map[string]any)["at"] != "2026-10-24T05:19:16Z" || points[7].(map[string]any)["at"] != "2026-10-24T05:30:17Z" {
		t.Fatalf("points = %v", points)
	}
}

func TestSearchEndpointReportsCoverage(t *testing.T) {
	status, body := request(t, appHandler(t), "/api/v1/search?q=zarya")
	if status != http.StatusOK || len(body["satellites"].([]any)) != 1 || body["groups_total"].(float64) != 1 {
		t.Fatalf("%d %v", status, body)
	}
	_, body = request(t, appHandler(t), "/api/v1/search?q=nothing")
	if satellites := body["satellites"].([]any); len(satellites) != 0 {
		t.Fatalf("satellites = %v", satellites)
	}
}

func TestLocalSourceListsItsGroup(t *testing.T) {
	handler := appHandler(t)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/satellites?group=Local+file", nil))
	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), "25544") {
		t.Fatalf("%d %s", recorder.Code, recorder.Body.String())
	}
}

func TestAppServesUIWithSecurityHeaders(t *testing.T) {
	recorder := httptest.NewRecorder()
	appHandler(t).ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/", nil))
	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), "app") {
		t.Fatalf("%d %q", recorder.Code, recorder.Body.String())
	}
	if recorder.Header().Get("X-Content-Type-Options") != "nosniff" || !strings.Contains(recorder.Header().Get("Content-Security-Policy"), "default-src 'self'") {
		t.Fatalf("headers = %v", recorder.Header())
	}
}

func TestPassesStopWhenRequestIsCanceled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	recorder := httptest.NewRecorder()
	appHandler(t).ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/passes?norad_id=25544"+greenwich, nil).WithContext(ctx))
	if recorder.Code == http.StatusOK {
		t.Fatalf("status = %d", recorder.Code)
	}
}
