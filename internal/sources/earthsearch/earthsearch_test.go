package earthsearch

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestRecentAsksForTheSatellitesOwnScenes(t *testing.T) {
	var hits atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		if !strings.Contains(r.URL.Query().Get("query"), `"sentinel-2a"`) || r.URL.Query().Get("collections") != "sentinel-2-l2a" {
			t.Errorf("query = %s", r.URL.RawQuery)
		}
		w.Write([]byte(`{"features":[{"id":"S2A_X","bbox":[10,20,12,24],"properties":{"datetime":"2026-11-09T13:33:55Z","eo:cloud_cover":69.5}}]}`))
	}))
	defer server.Close()
	c := NewAt(feed.NewClient(t.TempDir()), server.URL)
	scenes, _, err := c.Recent(context.Background(), "40697")
	if err != nil {
		t.Fatal(err)
	}
	if len(scenes) != 1 || scenes[0].CenterLat != 22 || scenes[0].CenterLon != 11 || *scenes[0].CloudCover != 69.5 {
		t.Fatalf("scenes = %+v", scenes)
	}
	before := hits.Load()
	other, _, err := c.Recent(context.Background(), "25544")
	if err != nil || len(other) != 0 || hits.Load() != before {
		t.Fatalf("other = %+v, err = %v, hits = %d", other, err, hits.Load()-before)
	}
}
