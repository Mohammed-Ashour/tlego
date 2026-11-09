package donki

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestRecentMergesEventTypesNewestFirst(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasSuffix(r.URL.Path, "/FLR"):
			w.Write([]byte(`[{"beginTime":"2026-11-02T01:00Z","classType":"M1.2","sourceLocation":"N10E20","link":"https://example.test/f"}]`))
		case strings.HasSuffix(r.URL.Path, "/CME"):
			// DONKI answers with an empty body when nothing happened.
		case strings.HasSuffix(r.URL.Path, "/GST"):
			w.Write([]byte(`[{"startTime":"2026-11-05T03:00Z","allKpIndex":[{"kpIndex":5},{"kpIndex":7}],"link":"https://example.test/g"}]`))
		}
	}))
	defer server.Close()
	events, meta, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Recent(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if meta.Warning != "" || len(events) != 2 || events[0].Kind != "Geomagnetic storm" || events[0].Detail != "Kp 7" || events[1].Detail != "M1.2 N10E20" {
		t.Fatalf("events = %+v, meta = %+v", events, meta)
	}
}

func TestRecentFailsOnlyWhenNothingLoads(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusBadGateway) }))
	defer server.Close()
	if _, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Recent(context.Background()); err == nil {
		t.Fatal("Recent succeeded with no data")
	}
}
