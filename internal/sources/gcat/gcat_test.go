package gcat

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

const table = "#JCAT\tSatcat\tPiece\tType\tName\tPLName\tLDate\tStatus\tOwner\tState\tManufacturer\tBus\tMass\tOpOrbit\n" +
	"# Updated 2026 Nov  9\n" +
	"S00001    \t00001\t1957 ALP 1\tR2          \t8K71\tM1\t1957 Oct  4\tR\tOKB1\tSU\tOKB1\tBlok-A\t    7790 \tLLEO/I\n" +
	"S25544    \t25544\t1998-067A\tPPTH-MU     \tZarya\t77KM\t1998 Nov 20\tGRP\tJSC\tUS\tKHRR\t-\t   20281?\tLLEO/I\n"

func TestLookupFindsARowAndCleansItsValues(t *testing.T) {
	var hits atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		w.Write([]byte(table))
	}))
	defer server.Close()
	c := NewAt(feed.NewClient(t.TempDir()), server.URL)
	record, _, err := c.Lookup(context.Background(), "25544")
	if err != nil {
		t.Fatal(err)
	}
	if record == nil || record.Name != "Zarya" || record.Kind != "Payload" || record.Bus != "" || record.MassKg == nil || *record.MassKg != 20281 {
		t.Fatalf("record = %+v", record)
	}
	missing, _, err := c.Lookup(context.Background(), "99999")
	if err != nil || missing != nil {
		t.Fatalf("missing = %+v, err = %v", missing, err)
	}
	if hits.Load() != 1 {
		t.Fatalf("provider saw %d downloads, want 1", hits.Load())
	}
}

func TestLookupRejectsAnotherFile(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("<html>moved</html>")) }))
	defer server.Close()
	if _, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Lookup(context.Background(), "25544"); err == nil {
		t.Fatal("Lookup accepted a page that is not the catalog")
	}
}
