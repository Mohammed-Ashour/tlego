package feed

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func accept([]byte) error { return nil }

func TestFetchReusesFreshResponseAndIdentifiesItself(t *testing.T) {
	var hits atomic.Int32
	var agent atomic.Value
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		agent.Store(r.UserAgent())
		w.Write([]byte("[]"))
	}))
	defer server.Close()
	client := NewClient(t.TempDir())
	request := Request{Source: "test", Key: "item", URL: server.URL, TTL: time.Hour, Validate: accept}
	for range 3 {
		if _, _, err := client.Fetch(context.Background(), request); err != nil {
			t.Fatal(err)
		}
	}
	if hits.Load() != 1 {
		t.Fatalf("provider saw %d requests, want 1", hits.Load())
	}
	if !strings.Contains(agent.Load().(string), "Khonsu") {
		t.Fatalf("User-Agent = %q", agent.Load())
	}
}

func TestFailedProviderServesSavedDataAndIsLeftAlone(t *testing.T) {
	var hits atomic.Int32
	var failing atomic.Bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		if failing.Load() {
			w.Header().Set("Retry-After", "120")
			w.WriteHeader(http.StatusTooManyRequests)
			return
		}
		w.Write([]byte("[]"))
	}))
	defer server.Close()
	client := NewClient(t.TempDir())
	current := time.Now().Add(2 * time.Hour) // Past the saved file's lifetime, so each call wants a refresh.
	client.Clock = func() time.Time { return current }
	request := Request{Source: "test", Key: "item", URL: server.URL, TTL: time.Hour, Validate: accept}
	if _, _, err := client.Fetch(context.Background(), request); err != nil {
		t.Fatal(err)
	}
	failing.Store(true)
	before := hits.Load()
	for range 3 {
		_, meta, err := client.Fetch(context.Background(), request)
		if err != nil {
			t.Fatal(err)
		}
		if !meta.Stale || meta.Warning == "" {
			t.Fatalf("meta = %+v, want stale data with a warning", meta)
		}
	}
	if got := hits.Load() - before; got != 1 {
		t.Fatalf("provider saw %d requests while failing, want 1", got)
	}
	current = current.Add(121 * time.Second)
	if _, _, err := client.Fetch(context.Background(), request); err != nil {
		t.Fatal(err)
	}
	if got := hits.Load() - before; got != 2 {
		t.Fatalf("provider saw %d requests after the pause, want 2", got)
	}
}

func TestFailureWithoutSavedDataIsAnError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusForbidden) }))
	defer server.Close()
	_, _, err := NewClient(t.TempDir()).Fetch(context.Background(), Request{Source: "test", Key: "item", URL: server.URL, TTL: time.Hour, Validate: accept})
	if err == nil || !strings.Contains(err.Error(), "403") {
		t.Fatalf("err = %v, want the provider's status", err)
	}
}

func TestCanonicalIDRejectsAnythingUnsafeForAQuery(t *testing.T) {
	if id, err := CanonicalID("025544"); err != nil || id != "25544" {
		t.Fatalf("CanonicalID = %q, %v", id, err)
	}
	for _, id := range []string{`1" } #`, "abc", "", "0"} {
		if _, err := CanonicalID(id); err == nil {
			t.Errorf("CanonicalID(%q) succeeded", id)
		}
	}
}
