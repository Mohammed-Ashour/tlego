package output

import (
	"encoding/json"
	"math"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/orbit"
)

func TestV1RejectsNonfiniteAndKeepsNullPassEvents(t *testing.T) {
	if _, err := MarshalResult("position", PositionRecord{LatitudeDeg: math.NaN()}, Provenance{}, nil); err == nil {
		t.Fatal("nonfinite numeric output accepted")
	}
	start := time.Date(2026, 10, 25, 0, 0, 0, 0, time.UTC)
	plan := PassPlanV1("25544", orbit.Observer{}, start, time.Hour, time.Minute, []orbit.Pass{{Start: start, End: start.Add(time.Hour), MaxTime: start, MaxElevationDeg: 45, StartClipped: true, EndClipped: true}})
	b, err := MarshalResult("passes", plan, Provenance{Source: "file", SourceFormat: "tle", ElementEpoch: start, CacheStatus: "none"}, nil)
	if err != nil {
		t.Fatal(err)
	}
	for _, field := range []string{`"rise_at": null`, `"set_at": null`, `"fetched_at": null`, `"warnings": []`} {
		if !strings.Contains(string(b), field) {
			t.Fatalf("missing %s: %s", field, b)
		}
	}
	var decoded Envelope
	if err := json.Unmarshal(b, &decoded); err != nil {
		t.Fatal(err)
	}
	if ValidateVersion("2.0") == nil {
		t.Fatal("unsupported version accepted")
	}
	empty := PassPlanV1("25544", orbit.Observer{}, start, time.Hour, time.Minute, nil)
	if empty.Passes == nil {
		t.Fatal("empty pass list must encode as []")
	}
}
