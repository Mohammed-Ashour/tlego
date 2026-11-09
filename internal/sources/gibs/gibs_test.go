package gibs

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestImageRequestsYesterdayAndRejectsEmptyPicture(t *testing.T) {
	var size int
	var query string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query = r.URL.RawQuery
		w.Write(append([]byte{0xFF, 0xD8, 0xFF}, bytes.Repeat([]byte{1}, size)...))
	}))
	defer server.Close()
	f := feed.NewClient(t.TempDir())
	f.Clock = func() time.Time { return time.Date(2026, 11, 9, 1, 0, 0, 0, time.UTC) }
	c := NewAt(f, server.URL)

	size = 12_000 // A sensor outage returns a valid but blank worldwide image.
	if _, _, err := c.Image(context.Background(), TrueColor); err == nil {
		t.Fatal("Image accepted a blank picture")
	}
	if !strings.Contains(query, "TIME=2026-11-08") || !strings.Contains(query, "VIIRS_NOAA20") {
		t.Fatalf("query = %s", query)
	}
}

func TestDailyImageExpiresAtUTCMidnight(t *testing.T) {
	var hits atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		w.Write(append([]byte{0xFF, 0xD8, 0xFF}, bytes.Repeat([]byte{1}, minImageBytes)...))
	}))
	defer server.Close()
	cache := t.TempDir()
	f := feed.NewClient(cache)
	now := time.Date(2026, 11, 8, 23, 50, 0, 0, time.UTC)
	f.Clock = func() time.Time { return now }
	c := NewAt(f, server.URL)
	// The feed client reads the saved file's age from its modification time, so set it to the fake clock.
	path := filepath.Join(cache, "sources", ID, TrueColor.ID+".jpg")
	if _, _, err := c.Image(context.Background(), TrueColor); err != nil {
		t.Fatal(err)
	}
	if err := os.Chtimes(path, now, now); err != nil {
		t.Fatal(err)
	}
	now = time.Date(2026, 11, 9, 0, 10, 0, 0, time.UTC)
	if _, _, err := c.Image(context.Background(), TrueColor); err != nil || hits.Load() != 2 {
		t.Fatalf("hits = %d, err = %v; want the picture saved before midnight to be refetched", hits.Load(), err)
	}
	if err := os.Chtimes(path, now, now); err != nil {
		t.Fatal(err)
	}
	now = time.Date(2026, 11, 9, 0, 20, 0, 0, time.UTC)
	if _, _, err := c.Image(context.Background(), TrueColor); err != nil || hits.Load() != 2 {
		t.Fatalf("hits = %d, err = %v; want the picture saved after midnight to be reused", hits.Load(), err)
	}
}

func TestImageAcceptsFullPictureAndRejectsErrorDocument(t *testing.T) {
	var body []byte
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write(body) }))
	defer server.Close()
	layer := NewLayer("partial", "Partial", Info, "", "Layer", true, false)
	c := NewAt(feed.NewClient(t.TempDir()), server.URL)
	body = []byte(`<ServiceException>no such layer</ServiceException>`)
	if _, _, err := c.Image(context.Background(), layer); err == nil {
		t.Fatal("Image accepted an XML error")
	}
	if _, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Image(context.Background(), layer); err == nil {
		t.Fatal("Image accepted an XML error from a fresh client")
	}
	body = append([]byte{0x89, 'P', 'N', 'G'}, bytes.Repeat([]byte{1}, minImageBytes)...)
	if image, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Image(context.Background(), layer); err != nil || len(image) != len(body) {
		t.Fatalf("len = %d, err = %v", len(image), err)
	}
}
