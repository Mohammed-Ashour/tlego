package wikidata

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestLookupGroupsRowsAndHidesUnlabeledValues(t *testing.T) {
	var query atomic.Value
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query.Store(r.URL.Query().Get("query"))
		w.Write([]byte(`{"results":{"bindings":[
			{"item":{"value":"http://www.wikidata.org/entity/Q25271"},"itemLabel":{"value":"ISS"},"typeLabel":{"value":"space station"},"operatorLabel":{"value":"NASA"},"launch":{"value":"1998-11-20T00:00:00Z"}},
			{"item":{"value":"http://www.wikidata.org/entity/Q25271"},"itemLabel":{"value":"ISS"},"typeLabel":{"value":"space station"},"operatorLabel":{"value":"Roscosmos"},"countryLabel":{"value":"Q99"}},
			{"item":{"value":"http://www.wikidata.org/entity/Q190"},"itemLabel":{"value":"First"}}
		]}}`))
	}))
	defer server.Close()
	entries, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Lookup(context.Background(), "025544")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(query.Load().(string), `wdt:P377 "25544"`) {
		t.Fatalf("query = %s", query.Load())
	}
	if len(entries) != 2 || entries[0].WikidataID != "Q190" {
		t.Fatalf("entries = %+v", entries)
	}
	if iss := entries[1]; len(iss.Operators) != 2 || len(iss.Types) != 1 || len(iss.Countries) != 0 || iss.LaunchDate != "1998-11-20" {
		t.Fatalf("iss = %+v", iss)
	}
}

func TestUnlabeledItemHasNoNameOrDescription(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"results":{"bindings":[
			{"item":{"value":"http://www.wikidata.org/entity/Q12345"},"itemLabel":{"value":"Q12345"},"itemDescription":{"value":"Q12346"}}
		]}}`))
	}))
	defer server.Close()
	entries, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Lookup(context.Background(), "25544")
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 1 || entries[0].Name != "" || entries[0].Description != "" {
		t.Fatalf("entries = %+v", entries)
	}
}

func TestMalformedResponseDoesNotReplaceSavedData(t *testing.T) {
	var body atomic.Value
	body.Store(`{"results":{"bindings":[{"item":{"value":"http://www.wikidata.org/entity/Q1"},"itemLabel":{"value":"Good"}}]}}`)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte(body.Load().(string))) }))
	defer server.Close()
	f := feed.NewClient(t.TempDir())
	c := NewAt(f, server.URL)
	if _, _, err := c.Lookup(context.Background(), "25544"); err != nil {
		t.Fatal(err)
	}
	body.Store(`<html>maintenance</html>`)
	later := time.Now().Add(entryTTL + time.Hour)
	f.Clock = func() time.Time { return later }
	entries, meta, err := c.Lookup(context.Background(), "25544")
	if err != nil {
		t.Fatal(err)
	}
	if !meta.Stale || len(entries) != 1 || entries[0].Name != "Good" {
		t.Fatalf("entries = %+v, meta = %+v", entries, meta)
	}
}
