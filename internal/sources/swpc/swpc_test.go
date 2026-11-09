package swpc

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func client(t *testing.T, handler http.HandlerFunc) *Client {
	t.Helper()
	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)
	f := feed.NewClient(t.TempDir())
	f.Clock = func() time.Time { return time.Date(2026, 11, 9, 18, 0, 0, 0, time.UTC) }
	return NewAt(f, server.URL)
}

func TestConditionsCombinesProducts(t *testing.T) {
	c := client(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasSuffix(r.URL.Path, "noaa-planetary-k-index.json"):
			w.Write([]byte(`[{"time_tag":"2026-11-09T12:00:00","Kp":2.33},{"time_tag":"2026-11-09T15:00:00","Kp":5.67}]`))
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
	weather, meta, err := c.Conditions(context.Background())
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

func TestConditionsSurvivesMissingOptionalProduct(t *testing.T) {
	c := client(t, func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "noaa-planetary-k-index.json") {
			w.Write([]byte(`[{"time_tag":"2026-11-09T12:00:00","Kp":2}]`))
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
	})
	weather, meta, err := c.Conditions(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if len(weather.Kp) != 1 || weather.Scales != nil || meta.Warning == "" {
		t.Fatalf("weather = %+v, meta = %+v", weather, meta)
	}
}
