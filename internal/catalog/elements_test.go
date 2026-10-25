package catalog

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func gpJSON(id, name string) string {
	return fmt.Sprintf(`{"OBJECT_NAME":%q,"NORAD_CAT_ID":%s,"EPOCH":"2025-01-02T03:04:05","MEAN_MOTION":15.5,"ECCENTRICITY":0.001,"INCLINATION":51.6,"RA_OF_ASC_NODE":247.4,"ARG_OF_PERICENTER":130.5,"MEAN_ANOMALY":325.0,"BSTAR":0.00001,"MEAN_MOTION_DOT":-0.00002,"MEAN_MOTION_DDOT":0}`, name, id)
}

func response(status int, body string) *http.Response {
	return &http.Response{StatusCode: status, Status: fmt.Sprintf("%d %s", status, http.StatusText(status)), Header: make(http.Header), Body: io.NopCloser(strings.NewReader(body))}
}

func TestFetchElementByNoradUsesGPJSONAndSeparateCache(t *testing.T) {
	old := CelestrakGPURL
	CelestrakGPURL = "https://fixture.invalid/gp.php?CATNR=NORADID&FORMAT=JSON"
	t.Cleanup(func() { CelestrakGPURL = old })
	var requests int
	client := &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		requests++
		if r.URL.Query().Get("FORMAT") != "JSON" {
			t.Fatalf("format query = %q", r.URL.Query().Get("FORMAT"))
		}
		return response(http.StatusOK, gpJSON("123456789", "large-id")), nil
	})}
	store := NewStoreWithClient(t.TempDir(), time.Hour, client)
	record, meta, err := store.FetchElementByNorad(context.Background(), "123456789")
	if err != nil || record.CatalogID != "123456789" || record.SourceFormat != "gp-json" || meta.FromCache {
		t.Fatalf("first fetch = (%+v, %+v, %v)", record, meta, err)
	}
	if _, err := os.Stat(filepath.Join(store.cacheDir, "elements", "norad", "123456789.json")); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(store.cacheDir, "norad", "123456789.tle")); !os.IsNotExist(err) {
		t.Fatalf("legacy cache unexpectedly present: %v", err)
	}
	_, meta, err = store.FetchElementByNorad(context.Background(), "123456789")
	if err != nil || !meta.FromCache || requests != 1 {
		t.Fatalf("cached fetch = (%+v, %v), requests=%d", meta, err, requests)
	}
}

func TestFetchElementRejectsMismatchedAndMalformedRefreshPreservesCache(t *testing.T) {
	old := CelestrakGPURL
	CelestrakGPURL = "https://fixture.invalid/gp.php?CATNR=NORADID&FORMAT=JSON"
	t.Cleanup(func() { CelestrakGPURL = old })
	body := gpJSON("25544", "ISS")
	client := &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) { return response(http.StatusOK, body), nil })}
	store := NewStoreWithClient(t.TempDir(), time.Second, client)
	path := filepath.Join(store.cacheDir, "elements", "norad", "25545.json")
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(gpJSON("25545", "known")), 0600); err != nil {
		t.Fatal(err)
	}
	oldTime := time.Now().Add(-time.Hour)
	if err := os.Chtimes(path, oldTime, oldTime); err != nil {
		t.Fatal(err)
	}
	before, _ := os.ReadFile(path)
	_, meta, err := store.fetchElements(context.Background(), "https://fixture.invalid", path, "25545")
	after, _ := os.ReadFile(path)
	if err != nil || !meta.Stale || !meta.FromCache {
		t.Fatalf("stale fetch = (%+v, %v)", meta, err)
	}
	if string(before) != string(after) {
		t.Fatal("bad response replaced known-good cache")
	}
}

func TestParseElementsDetectsGPAndReportsUnsupportedFormats(t *testing.T) {
	records, err := ParseElements([]byte("[" + gpJSON("25544", "ISS") + "]"))
	if err != nil || len(records) != 1 || records[0].CatalogID != "25544" {
		t.Fatalf("ParseElements = (%+v, %v)", records, err)
	}
	for _, input := range []string{"OBJECT_NAME,NORAD_CAT_ID", "<omm></omm>", "CCSDS_OMM_VERS = 2.0"} {
		if _, err := ParseElements([]byte(input)); err == nil || !strings.Contains(err.Error(), "unsupported element format") {
			t.Errorf("ParseElements(%q) error = %v", input, err)
		}
	}
}

func TestFetchElementsUsesFreshLegacyCacheWithoutNetwork(t *testing.T) {
	store := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		t.Fatal("fresh legacy cache should avoid network")
		return nil, nil
	})})
	legacyPath := filepath.Join(store.cacheDir, "norad", "25544.tle")
	if err := os.MkdirAll(filepath.Dir(legacyPath), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(legacyPath, []byte(validTLE), 0600); err != nil {
		t.Fatal(err)
	}
	records, meta, err := store.fetchElements(context.Background(), "https://fixture.invalid", filepath.Join(store.cacheDir, "elements", "norad", "25544.json"), "25544")
	if err != nil || len(records) != 1 || records[0].SourceFormat != "tle" || meta.Format != "tle" || meta.Path != legacyPath || !meta.FromCache || meta.Stale {
		t.Fatalf("legacy cache result = (%+v, %+v, %v)", records, meta, err)
	}
}

func TestFetchElementsUsesExpiredLegacyCacheAfterGPFailure(t *testing.T) {
	store := NewStoreWithClient(t.TempDir(), time.Second, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		return response(http.StatusNotFound, "missing"), nil
	})})
	legacyPath := filepath.Join(store.cacheDir, "groups", "stations.tle")
	if err := os.MkdirAll(filepath.Dir(legacyPath), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(legacyPath, []byte(validTLE), 0600); err != nil {
		t.Fatal(err)
	}
	oldTime := time.Now().Add(-time.Hour)
	if err := os.Chtimes(legacyPath, oldTime, oldTime); err != nil {
		t.Fatal(err)
	}
	records, meta, err := store.fetchElements(context.Background(), "https://fixture.invalid", filepath.Join(store.cacheDir, "elements", "groups", "stations.json"), "")
	if err != nil || len(records) != 1 || records[0].SourceFormat != "tle" || meta.Format != "tle" || meta.Path != legacyPath || !meta.FromCache || !meta.Stale || meta.Warning == "" {
		t.Fatalf("stale legacy cache result = (%+v, %+v, %v)", records, meta, err)
	}
}

func TestFetchElementsPrefersModernJSONAndHonorsCancellation(t *testing.T) {
	store := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		t.Fatal("fresh JSON cache should avoid network")
		return nil, nil
	})})
	legacyPath := filepath.Join(store.cacheDir, "norad", "25544.tle")
	jsonPath := filepath.Join(store.cacheDir, "elements", "norad", "25544.json")
	if err := os.MkdirAll(filepath.Dir(legacyPath), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Dir(jsonPath), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(legacyPath, []byte(validTLE), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(jsonPath, []byte(gpJSON("25544", "modern")), 0600); err != nil {
		t.Fatal(err)
	}
	records, meta, err := store.fetchElements(context.Background(), "https://fixture.invalid", jsonPath, "25544")
	if err != nil || len(records) != 1 || records[0].SourceFormat != "gp-json" || records[0].Name != "modern" || meta.Format != "gp-json" {
		t.Fatalf("modern cache result = (%+v, %+v, %v)", records, meta, err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, _, err := store.fetchElements(ctx, "https://fixture.invalid", jsonPath, "25544"); err == nil {
		t.Fatal("canceled request returned cached records")
	}
}

func TestParseElementsRecognizesJSONBeforeOMMKeywords(t *testing.T) {
	payload := strings.TrimSuffix(gpJSON("123456789", "META_START satellite"), "}") + `,"CCSDS_OMM_VERS":"2.0"}`
	records, err := ParseElements([]byte(payload))
	if err != nil || len(records) != 1 {
		t.Fatalf("valid OMM JSON rejected: %v", err)
	}
	payload = strings.Replace(validTLE, "ISS (ZARYA)", "ISS, original name", 1)
	records, err = ParseElements([]byte(payload))
	if err != nil || records[0].Name != "ISS, original name" {
		t.Fatalf("TLE name with comma rejected: %v", err)
	}
}

func TestStaleModernCacheTakesPriorityOverFreshLegacy(t *testing.T) {
	store := NewStoreWithClient(t.TempDir(), time.Second, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		return response(http.StatusServiceUnavailable, "offline"), nil
	})})
	modern := filepath.Join(store.cacheDir, "elements", "groups", "stations.json")
	legacy := filepath.Join(store.cacheDir, "groups", "stations.tle")
	for _, path := range []string{modern, legacy} {
		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(modern, []byte(gpJSON("799500001", "modern")), 0600); err != nil {
		t.Fatal(err)
	}
	old := time.Now().Add(-time.Hour)
	if err := os.Chtimes(modern, old, old); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(legacy, []byte(validTLE), 0600); err != nil {
		t.Fatal(err)
	}
	records, meta, err := store.fetchElements(context.Background(), "https://fixture.invalid", modern, "")
	if err != nil || !meta.Stale || meta.Format != "gp-json" || len(records) != 1 || records[0].CatalogID != "799500001" {
		t.Fatalf("modern data lost to legacy fallback: %+v %+v %v", records, meta, err)
	}
}
