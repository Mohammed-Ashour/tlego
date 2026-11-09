package launchlibrary

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestUpcomingSkipsThoseAlreadyFlown(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"results":[
			{"name":"Flown","net":"2026-11-08T20:24:00Z","status":{"name":"Launch Successful","abbrev":"Success"}},
			{"name":"Next","net":"2026-11-12T01:00:00Z","status":{"name":"Go for Launch","abbrev":"Go"},"net_precision":{"name":"Minute"}}
		]}`))
	}))
	defer server.Close()
	launches, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Upcoming(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if len(launches) != 1 || launches[0].Name != "Next" || launches[0].Precision != "Minute" {
		t.Fatalf("launches = %+v", launches)
	}
}
