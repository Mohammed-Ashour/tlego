package output

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
)

func TestBuildReportAtPreservesLegacyEncodingAndNormalizesGeneratedTime(t *testing.T) {
	element := tle.TLE{Name: "Fixture", NoradID: "12345"}
	// The legacy builder obtains the epoch through TLE.Time, so supply a parseable line.
	element.Line1 = tle.TLELine1{EpochYear: "08", EpochDay: "264.51782528"}
	generated := time.Date(2026, 10, 25, 14, 0, 0, 0, time.FixedZone("plus2", 2*3600))
	r, err := BuildReportAt(element, orbit.Position{LatDeg: 1.25}, orbit.OrbitInfo{OrbitClass: "LEO"}, "https://map", generated)
	if err != nil {
		t.Fatal(err)
	}
	if r.Generated.Location() != time.UTC || !r.Generated.Equal(generated.UTC()) {
		t.Fatalf("Generated = %v, want UTC %v", r.Generated, generated.UTC())
	}
	b, err := FormatReportJSON(r)
	if err != nil {
		t.Fatal(err)
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(b, &fields); err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"name", "norad_id", "epoch", "generated_at", "tle", "position", "orbit", "map_url"} {
		if _, ok := fields[key]; !ok {
			t.Errorf("legacy JSON field %q missing", key)
		}
	}
	var nested map[string]json.RawMessage
	if err := json.Unmarshal(fields["orbit"], &nested); err != nil {
		t.Fatal(err)
	}
	if _, ok := nested["OrbitClass"]; !ok {
		t.Fatal("legacy exported-field encoding for OrbitClass missing")
	}
	csv, err := FormatReportCSV(r)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(csv, "name,norad_id,epoch,generated_at,lat_deg") {
		t.Fatalf("unexpected legacy CSV header: %q", csv)
	}
}
