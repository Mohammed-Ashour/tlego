package feed

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func accept([]byte) error { return nil }

func TestInvalidResponseWaitsForFailurePause(t *testing.T) {
	var hits atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		w.Write([]byte("<html>moved</html>"))
	}))
	defer server.Close()
	client := NewClient(t.TempDir())
	reject := func([]byte) error { return errors.New("not the expected format") }
	request := Request{Source: "test", Key: "item", URL: server.URL, TTL: time.Hour, Validate: reject}
	for range 3 {
		if _, _, err := client.Fetch(context.Background(), request); err == nil {
			t.Fatal("Fetch accepted an invalid response")
		}
	}
	if hits.Load() != 1 {
		t.Fatalf("provider saw %d requests, want 1", hits.Load())
	}
}

func TestPrepareFailurePauseDependsOnCause(t *testing.T) {
	for _, tc := range []struct {
		name  string
		err   error
		pause time.Duration
	}{
		{"rejected credentials", fmt.Errorf("login: %w", ErrCredentialsRejected), longestPause},
		{"network blip", errors.New("connection reset"), failurePause},
	} {
		t.Run(tc.name, func(t *testing.T) {
			client := NewClient(t.TempDir())
			now := time.Now()
			client.Clock = func() time.Time { return now }
			request := Request{Source: "test", Key: "item", URL: "http://127.0.0.1:1", TTL: time.Hour, Validate: accept, Prepare: func(context.Context) error { return tc.err }}
			if _, _, err := client.Fetch(context.Background(), request); err == nil {
				t.Fatal("Fetch succeeded after Prepare failed")
			}
			if got := client.gateFor("test").blockedUntil.Sub(now); got != tc.pause {
				t.Fatalf("pause = %v, want %v", got, tc.pause)
			}
		})
	}
}

func TestRetryPause(t *testing.T) {
	now := time.Date(2026, 11, 9, 12, 0, 0, 0, time.UTC)
	client := NewClient(t.TempDir())
	client.Clock = func() time.Time { return now }
	for _, tc := range []struct {
		name, header string
		want         time.Duration
	}{
		{"seconds", "120", 2 * time.Minute},
		{"zero", "0", failurePause},
		{"negative", "-5", failurePause},
		{"huge seconds are capped", "99999999999", longestPause},
		{"empty", "", failurePause},
		{"unparseable", "soon", failurePause},
		{"future date", now.Add(10 * time.Minute).Format(http.TimeFormat), 10 * time.Minute},
		{"far future date is capped", now.Add(48 * time.Hour).Format(http.TimeFormat), longestPause},
		{"past date", now.Add(-time.Minute).Format(http.TimeFormat), failurePause},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if got := client.retryPause(tc.header); got != tc.want {
				t.Fatalf("retryPause(%q) = %v, want %v", tc.header, got, tc.want)
			}
		})
	}
}

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
