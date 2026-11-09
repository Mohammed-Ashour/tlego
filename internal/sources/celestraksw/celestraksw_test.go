package celestraksw

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestRecentKeepsOnlyObservedDays(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("DATE,KP1,KP2,KP3,KP4,KP5,KP6,KP7,KP8,F10.7_OBS,F10.7_DATA_TYPE\n" +
			"2026-11-01,0,3,7,3,3,73,7,7,80.4,OBS\n" +
			"2026-11-02,,,,,,,,,90.0,PRD\n"))
	}))
	defer server.Close()
	days, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Recent(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if len(days) != 1 || days[0].Date != "2026-11-01" || days[0].KpMax != 7.3 || days[0].F107 != 80.4 {
		t.Fatalf("days = %+v", days)
	}
}
