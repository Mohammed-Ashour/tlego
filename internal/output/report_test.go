package output

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/khonsu/internal/elements"
	"github.com/Mohammed-Ashour/khonsu/internal/orbit"
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

func TestReportCarriesOrbitExplanationInV1AndTextOnly(t *testing.T) {
	record := elements.Record{Name: "Fixture", CatalogID: "12345", Epoch: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC), SourceFormat: "gp-json",
		MeanMotionRevDay: 15.5, Eccentricity: 0.0007, InclinationDeg: 51.6, Raw: []byte(`{}`)}
	info, err := orbit.OrbitInfoFromElements(record)
	if err != nil {
		t.Fatal(err)
	}
	r, err := BuildElementReportAt(record, orbit.Position{}, info, "https://map", time.Now())
	if err != nil {
		t.Fatal(err)
	}
	if r.Explanation == nil || r.Explanation.Regime != "LEO" {
		t.Fatalf("explanation = %+v", r.Explanation)
	}
	v1, err := json.Marshal(ReportV1(r))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(v1), `"explanation":{"regime":"LEO"`) {
		t.Errorf("v1 orbit lacks explanation: %s", v1)
	}
	legacy, err := FormatReportJSON(r)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(legacy), "explanation") || strings.Contains(string(legacy), "Explanation") {
		t.Errorf("legacy JSON changed shape: %s", legacy)
	}
	text := FormatReportText(r)
	if !strings.Contains(text, "Why It's Up There (Low Earth orbit):") || !strings.Contains(text, "about 15.5 times a day") {
		t.Errorf("text report lacks explanation:\n%s", text)
	}
	r.Explanation = nil
	if v1, _ := json.Marshal(ReportV1(r)); strings.Contains(string(v1), "explanation") {
		t.Errorf("empty explanation should be omitted: %s", v1)
	}
}
