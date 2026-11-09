package openmeteo

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestCloudsRoundsLocationAndStartsAtTheCurrentHour(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("latitude") != "51.5" || r.URL.Query().Get("longitude") != "-0.1" {
			t.Errorf("sent an unrounded location: %s", r.URL.RawQuery)
		}
		w.Write([]byte(`{"hourly":{"time":["2026-11-09T10:00","2026-11-09T12:00","2026-11-09T13:00"],"cloud_cover":[1,40,null]}}`))
	}))
	defer server.Close()
	f := feed.NewClient(t.TempDir())
	f.Clock = func() time.Time { return time.Date(2026, 11, 9, 12, 30, 0, 0, time.UTC) }
	hours, _, err := NewAt(f, server.URL).Clouds(context.Background(), 51.4834, -0.1234)
	if err != nil {
		t.Fatal(err)
	}
	if len(hours) != 1 || hours[0].Percent != 40 {
		t.Fatalf("hours = %+v", hours)
	}
}
