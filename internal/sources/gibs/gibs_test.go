package gibs

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
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
