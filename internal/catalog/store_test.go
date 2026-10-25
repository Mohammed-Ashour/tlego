package catalog

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

const validTLE = "ISS (ZARYA)\n" +
	"1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927\n" +
	"2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537\n"

func TestFetchURLFetchesAndThenUsesCache(t *testing.T) {
	var requests atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests.Add(1)
		_, _ = w.Write([]byte(validTLE))
	}))
	defer server.Close()

	store := NewStore(t.TempDir(), time.Hour)
	store.client = server.Client()
	path := filepath.Join(store.cacheDir, "norad", "25544.tle")
	tles, meta, err := store.fetchURL(context.Background(), server.URL, path, "25544")
	if err != nil || len(tles) != 1 || tles[0].NoradID != "25544" || meta.FromCache {
		t.Fatalf("first fetch = (%d TLEs, %+v, %v)", len(tles), meta, err)
	}
	tles, meta, err = store.fetchURL(context.Background(), server.URL, path, "25544")
	if err != nil || len(tles) != 1 || !meta.FromCache || requests.Load() != 1 {
		t.Fatalf("cached fetch = (%d TLEs, %+v, %v), requests=%d", len(tles), meta, err, requests.Load())
	}
}

func TestMalformedRefreshKeepsKnownGoodStaleCache(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("2 malformed\n"))
	}))
	defer server.Close()

	store := NewStore(t.TempDir(), time.Second)
	store.client = server.Client()
	path := filepath.Join(store.cacheDir, "norad", "25544.tle")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(validTLE), 0o600); err != nil {
		t.Fatal(err)
	}
	old := time.Now().Add(-time.Hour)
	if err := os.Chtimes(path, old, old); err != nil {
		t.Fatal(err)
	}
	before, _ := os.ReadFile(path)
	tles, meta, err := store.fetchURL(context.Background(), server.URL, path, "25544")
	after, _ := os.ReadFile(path)
	if err != nil || len(tles) != 1 || !meta.Stale || !meta.FromCache || meta.Warning == "" {
		t.Fatalf("stale fallback = (%d TLEs, %+v, %v)", len(tles), meta, err)
	}
	if string(before) != string(after) {
		t.Fatal("malformed response replaced the known-good cache")
	}
}

func TestCorruptCacheIsRefetched(t *testing.T) {
	var requests atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests.Add(1)
		_, _ = w.Write([]byte(validTLE))
	}))
	defer server.Close()

	store := NewStore(t.TempDir(), time.Hour)
	store.client = server.Client()
	path := filepath.Join(store.cacheDir, "norad", "25544.tle")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte("corrupt cache"), 0o600); err != nil {
		t.Fatal(err)
	}
	tles, meta, err := store.fetchURL(context.Background(), server.URL, path, "25544")
	if err != nil || len(tles) != 1 || meta.FromCache || requests.Load() != 1 {
		t.Fatalf("refetch = (%d TLEs, %+v, %v), requests=%d", len(tles), meta, err, requests.Load())
	}
}

func TestNoradIDsValidatedBeforeRequestAndResponseIdentityChecked(t *testing.T) {
	var requests atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests.Add(1)
		_, _ = w.Write([]byte(validTLE))
	}))
	defer server.Close()

	store := NewStore(t.TempDir(), time.Hour)
	store.client = server.Client()
	for _, id := range []string{"", "0", "../25544", "12x", "1234567890"} {
		if _, _, err := store.FetchTLEByNorad(context.Background(), id); err == nil {
			t.Errorf("FetchTLEByNorad(%q) succeeded", id)
		}
	}
	if requests.Load() != 0 {
		t.Fatalf("invalid IDs made %d requests", requests.Load())
	}
	path := filepath.Join(store.cacheDir, "norad", "25545.tle")
	if _, _, err := store.fetchURL(context.Background(), server.URL, path, "25545"); err == nil || !strings.Contains(err.Error(), "does not match") {
		t.Fatalf("mismatched response error = %v", err)
	}
	if _, err := os.Stat(path); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("mismatched response created cache file: stat err=%v", err)
	}
	if err := validateTLEPayload([]byte(validTLE), "025544"); err != nil {
		t.Fatalf("zero-padded numeric ID should match: %v", err)
	}
}

func TestMalformedNumericTLEIsRejectedBeforeCaching(t *testing.T) {
	malformed := []byte(validTLE)
	line2Start := strings.Index(string(malformed), "2 ")
	copy(malformed[line2Start+52:line2Start+63], "not-a-number")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write(malformed)
	}))
	defer server.Close()
	store := NewStore(t.TempDir(), time.Hour)
	store.client = server.Client()
	path := filepath.Join(store.cacheDir, "groups", "numbers.tle")
	if _, _, err := store.fetchURL(context.Background(), server.URL, path, ""); err == nil {
		t.Fatal("malformed numeric fields were accepted")
	}
	if _, err := os.Stat(path); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("malformed numeric response was cached: stat err=%v", err)
	}
}

func TestFetchURLCancellationAndHTTPStatusError(t *testing.T) {
	t.Run("cancellation", func(t *testing.T) {
		started := make(chan struct{})
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			close(started)
			<-r.Context().Done()
		}))
		defer server.Close()
		store := NewStore(t.TempDir(), time.Hour)
		store.client = server.Client()
		ctx, cancel := context.WithCancel(context.Background())
		go func() {
			<-started
			cancel()
		}()
		_, _, err := store.fetchURL(ctx, server.URL, filepath.Join(store.cacheDir, "x.tle"), "")
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("cancellation error = %v", err)
		}
	})

	t.Run("cancellation does not use stale cache", func(t *testing.T) {
		started := make(chan struct{})
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			close(started)
			<-r.Context().Done()
		}))
		defer server.Close()
		store := NewStore(t.TempDir(), time.Second)
		store.client = server.Client()
		path := filepath.Join(store.cacheDir, "cached.tle")
		if err := os.WriteFile(path, []byte(validTLE), 0o600); err != nil {
			t.Fatal(err)
		}
		old := time.Now().Add(-time.Hour)
		if err := os.Chtimes(path, old, old); err != nil {
			t.Fatal(err)
		}
		ctx, cancel := context.WithCancel(context.Background())
		go func() {
			<-started
			cancel()
		}()
		_, meta, err := store.fetchURL(ctx, server.URL, path, "")
		if !errors.Is(err, context.Canceled) || meta.Stale {
			t.Fatalf("canceled stale refresh = (%+v, %v)", meta, err)
		}
	})

	t.Run("status error", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "unavailable", http.StatusServiceUnavailable)
		}))
		defer server.Close()
		store := NewStore(t.TempDir(), time.Hour)
		store.client = server.Client()
		_, _, err := store.fetchURL(context.Background(), server.URL, filepath.Join(store.cacheDir, "x.tle"), "")
		if err == nil || !strings.Contains(err.Error(), "503") {
			t.Fatalf("status error = %v", err)
		}
	})
}
