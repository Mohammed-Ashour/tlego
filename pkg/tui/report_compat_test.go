package tui

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/output"
)

func TestReportCommandsKeepLegacyAndOfferV1(t *testing.T) {
	records, err := catalog.ReadLocalTLE("../../examples/tui-demo/iss.tle")
	if err != nil {
		t.Fatal(err)
	}
	record := records[0]
	sat := satellite.NewSatelliteFromTLE(record, satellite.GravityWGS84)
	info, err := OrbitInfoFromTLE(record)
	if err != nil {
		t.Fatal(err)
	}
	fetched := time.Now().UTC()
	for _, format := range []string{"json", "json-v1"} {
		msg := reportCmd(record, sat, info, "google", format, catalog.FetchMeta{FetchedAt: fetched, FromCache: true})().(reportBuiltMsg)
		if msg.err != nil {
			t.Fatal(msg.err)
		}
		if format == "json" {
			var legacy map[string]json.RawMessage
			if err := json.Unmarshal([]byte(msg.output), &legacy); err != nil {
				t.Fatal(err)
			}
			if _, ok := legacy["schema_version"]; ok {
				t.Fatal("legacy report silently became versioned")
			}
			for _, key := range []string{"norad_id", "position", "orbit", "generated_at"} {
				if _, ok := legacy[key]; !ok {
					t.Fatalf("missing legacy key %s", key)
				}
			}
		} else {
			var v1 struct {
				SchemaVersion string              `json:"schema_version"`
				Kind          string              `json:"kind"`
				Data          output.ReportRecord `json:"data"`
				Provenance    output.Provenance   `json:"provenance"`
			}
			if err := json.Unmarshal([]byte(msg.output), &v1); err != nil {
				t.Fatal(err)
			}
			if v1.SchemaVersion != "1.0" || v1.Kind != "report" || v1.Data.CatalogID != record.NoradID || v1.Provenance.CacheStatus != "fresh" || v1.Provenance.FetchedAt == nil {
				t.Fatalf("bad versioned UI report: %+v", v1)
			}
		}
	}
}
