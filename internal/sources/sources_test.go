package sources

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestCatalogIsComplete(t *testing.T) {
	seen := map[string]bool{}
	total := 0
	for _, group := range Catalog() {
		if len(group.Sources) == 0 {
			t.Errorf("category %s has no sources", group.ID)
		}
		for _, source := range group.Sources {
			total++
			if seen[source.ID] {
				t.Errorf("duplicate source %s", source.ID)
			}
			seen[source.ID] = true
			if source.Name == "" || source.Credit == "" || !strings.HasPrefix(source.URL, "https://") || source.Summary == "" || source.Nature == "" || source.Refresh == "" {
				t.Errorf("source %s is missing details: %+v", source.ID, source)
			}
			if source.Status != StatusLive && source.Status != StatusPlanned {
				t.Errorf("source %s has status %q", source.ID, source.Status)
			}
		}
	}
	if total != len(allSources) {
		t.Fatalf("Catalog() listed %d of %d sources; one has an unknown category", total, len(allSources))
	}
}

type fakeProvider struct {
	*httptest.Server
	hits atomic.Int32
}

func newClient(t *testing.T, handler http.HandlerFunc) (*Client, *fakeProvider) {
	t.Helper()
	provider := &fakeProvider{}
	provider.Server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		provider.hits.Add(1)
		handler(w, r)
	}))
	t.Cleanup(provider.Close)
	client := NewClient(t.TempDir())
	client.endpoints = Endpoints{SWPC: provider.URL, Wikidata: provider.URL + "/sparql", SatNOGS: provider.URL, LaunchLibrary: provider.URL}
	return client, provider
}

func testRequest(body func() error) request {
	return request{source: "test", key: "item", ttl: time.Hour, validate: func(b []byte) error {
		if body != nil {
			return body()
		}
		return nil
	}}
}

func TestFetchReusesFreshResponseAndIdentifiesItself(t *testing.T) {
	var agent string
	client, provider := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		agent = r.UserAgent()
		w.Write([]byte("[]"))
	})
	r := testRequest(nil)
	r.url = provider.URL
	for range 3 {
		if _, _, err := client.fetch(context.Background(), r); err != nil {
			t.Fatal(err)
		}
	}
	if provider.hits.Load() != 1 {
		t.Fatalf("provider saw %d requests, want 1", provider.hits.Load())
	}
	if !strings.Contains(agent, "Khonsu") {
		t.Fatalf("User-Agent = %q", agent)
	}
}

func TestFailedProviderServesSavedDataAndIsLeftAlone(t *testing.T) {
	var failing atomic.Bool
	client, provider := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		if failing.Load() {
			w.Header().Set("Retry-After", "120")
			w.WriteHeader(http.StatusTooManyRequests)
			return
		}
		w.Write([]byte("[]"))
	})
	current := time.Now().Add(2 * time.Hour) // Past the saved file's lifetime, so each call wants a refresh.
	client.now = func() time.Time { return current }
	r := testRequest(nil)
	r.url = provider.URL
	if _, _, err := client.fetch(context.Background(), r); err != nil {
		t.Fatal(err)
	}
	failing.Store(true)
	before := provider.hits.Load()
	for range 3 {
		_, meta, err := client.fetch(context.Background(), r)
		if err != nil {
			t.Fatal(err)
		}
		if !meta.Stale || meta.Warning == "" {
			t.Fatalf("meta = %+v, want stale data with a warning", meta)
		}
	}
	if got := provider.hits.Load() - before; got != 1 {
		t.Fatalf("provider saw %d requests while failing, want 1", got)
	}
	current = current.Add(121 * time.Second)
	if _, _, err := client.fetch(context.Background(), r); err != nil {
		t.Fatal(err)
	}
	if got := provider.hits.Load() - before; got != 2 {
		t.Fatalf("provider saw %d requests after the pause, want 2", got)
	}
}

func TestMalformedResponseDoesNotReplaceSavedData(t *testing.T) {
	var body atomic.Value
	body.Store(`{"results":{"bindings":[{"item":{"value":"http://www.wikidata.org/entity/Q1"},"itemLabel":{"value":"Good"}}]}}`)
	client, _ := newClient(t, func(w http.ResponseWriter, r *http.Request) { w.Write([]byte(body.Load().(string))) })
	if _, _, err := client.SatelliteDetails(context.Background(), "25544"); err != nil {
		t.Fatal(err)
	}
	body.Store(`<html>maintenance</html>`)
	current := time.Now().Add(satelliteTTL + time.Hour)
	client.now = func() time.Time { return current }
	entries, meta, err := client.SatelliteDetails(context.Background(), "25544")
	if err != nil {
		t.Fatal(err)
	}
	if !meta.Stale || len(entries) != 1 || entries[0].Name != "Good" {
		t.Fatalf("entries = %+v, meta = %+v", entries, meta)
	}
}

func TestProviderFailureWithoutSavedDataIsAnError(t *testing.T) {
	client, _ := newClient(t, func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusForbidden) })
	if _, _, err := client.Transmitters(context.Background(), "25544"); err == nil || !strings.Contains(err.Error(), "403") {
		t.Fatalf("err = %v, want the provider's status", err)
	}
}

func TestSpaceWeatherCombinesProducts(t *testing.T) {
	client, _ := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasSuffix(r.URL.Path, "noaa-planetary-k-index.json"):
			w.Write([]byte(`[{"time_tag":"2026-11-09T12:00:00","Kp":2.33,"a_running":9,"station_count":8},{"time_tag":"2026-11-09T15:00:00","Kp":5.67,"a_running":9,"station_count":8}]`))
		case strings.HasSuffix(r.URL.Path, "10cm-flux-30-day.json"):
			w.Write([]byte(`[{"time_tag":"2026-11-09T20:00:00","flux":141}]`))
		case strings.HasSuffix(r.URL.Path, "noaa-scales.json"):
			w.Write([]byte(`{"0":{"R":{"Scale":"0","Text":"none"},"S":{"Scale":"1","Text":"minor"},"G":{"Scale":"2","Text":"moderate"}},"1":{"R":{"Scale":null,"Text":null},"S":{"Scale":null,"Text":null},"G":{"Scale":"4","Text":"severe"}}}`))
		case strings.HasSuffix(r.URL.Path, "alerts.json"):
			w.Write([]byte(`[{"product_id":"OLD","issue_datetime":"2026-11-01 01:00:00.000","message":"ALERT: Old"},{"product_id":"K04W","issue_datetime":"2026-11-09 17:55:46.807","message":"Space Weather Message Code: WARK04\r\nSerial Number: 5452\r\n\r\nEXTENDED WARNING: Geomagnetic K-index of 4 expected\nValid From: x"}]`))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	})
	client.now = func() time.Time { return time.Date(2026, 11, 9, 18, 0, 0, 0, time.UTC) }
	weather, meta, err := client.SpaceWeather(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if meta.Warning != "" || len(weather.Kp) != 2 || weather.Kp[1].Kp != 5.67 || weather.Flux[0].Flux != 141 {
		t.Fatalf("weather = %+v, meta = %+v", weather, meta)
	}
	if weather.Scales == nil || weather.Scales.Geomagnetic.Level != "2" || weather.Scales.Solar.Text != "minor" {
		t.Fatalf("scales = %+v, want the current day's values", weather.Scales)
	}
	if len(weather.Alerts) != 1 || weather.Alerts[0].Headline != "EXTENDED WARNING: Geomagnetic K-index of 4 expected" {
		t.Fatalf("alerts = %+v", weather.Alerts)
	}
}

func TestSpaceWeatherSurvivesMissingOptionalProduct(t *testing.T) {
	client, _ := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "noaa-planetary-k-index.json") {
			w.Write([]byte(`[{"time_tag":"2026-11-09T12:00:00","Kp":2}]`))
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
	})
	weather, meta, err := client.SpaceWeather(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if len(weather.Kp) != 1 || weather.Scales != nil || meta.Warning == "" {
		t.Fatalf("weather = %+v, meta = %+v", weather, meta)
	}
}

func TestSatelliteDetailsGroupsRowsAndHidesUnlabeledValues(t *testing.T) {
	var query string
	client, _ := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		query = r.URL.Query().Get("query")
		w.Write([]byte(`{"results":{"bindings":[
			{"item":{"value":"http://www.wikidata.org/entity/Q25271"},"itemLabel":{"value":"ISS"},"typeLabel":{"value":"space station"},"operatorLabel":{"value":"NASA"},"launch":{"value":"1998-11-20T00:00:00Z"}},
			{"item":{"value":"http://www.wikidata.org/entity/Q25271"},"itemLabel":{"value":"ISS"},"typeLabel":{"value":"space station"},"operatorLabel":{"value":"Roscosmos"},"countryLabel":{"value":"Q99"}},
			{"item":{"value":"http://www.wikidata.org/entity/Q190"},"itemLabel":{"value":"First"}}
		]}}`))
	})
	entries, _, err := client.SatelliteDetails(context.Background(), "025544")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(query, `wdt:P377 "25544"`) {
		t.Fatalf("query = %s", query)
	}
	if len(entries) != 2 || entries[0].WikidataID != "Q190" {
		t.Fatalf("entries = %+v", entries)
	}
	iss := entries[1]
	if len(iss.Operators) != 2 || len(iss.Types) != 1 || len(iss.Countries) != 0 || iss.LaunchDate != "1998-11-20" {
		t.Fatalf("iss = %+v", iss)
	}
}

func TestInvalidIDNeverReachesProvider(t *testing.T) {
	client, provider := newClient(t, func(w http.ResponseWriter, r *http.Request) {})
	for _, id := range []string{`1" } #`, "abc", "", "0"} {
		if _, _, err := client.SatelliteDetails(context.Background(), id); err == nil {
			t.Errorf("SatelliteDetails(%q) succeeded", id)
		}
	}
	if provider.hits.Load() != 0 {
		t.Fatalf("provider saw %d requests", provider.hits.Load())
	}
}

func TestUpcomingLaunchesSkipsThoseAlreadyFlown(t *testing.T) {
	client, _ := newClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"results":[
			{"name":"Flown","net":"2026-11-08T20:24:00Z","status":{"name":"Launch Successful","abbrev":"Success"}},
			{"name":"Next","net":"2026-11-12T01:00:00Z","status":{"name":"Go for Launch","abbrev":"Go"},"net_precision":{"name":"Minute"}}
		]}`))
	})
	launches, _, err := client.UpcomingLaunches(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if len(launches) != 1 || launches[0].Name != "Next" || launches[0].Precision != "Minute" {
		t.Fatalf("launches = %+v", launches)
	}
}
