package orbit

import (
	"math"
	"os"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/elements"
)

// testdata/explain-gp.json holds CelesTrak GP elements fetched on 2026-11-13.
func loadExplainFixtures(t *testing.T) map[string]elements.Record {
	t.Helper()
	data, err := os.ReadFile("testdata/explain-gp.json")
	if err != nil {
		t.Fatal(err)
	}
	records, err := elements.ParseGPJSON(data)
	if err != nil {
		t.Fatal(err)
	}
	byName := map[string]elements.Record{}
	for _, r := range records {
		byName[r.Name] = r
	}
	return byName
}

func TestExplainRealSatellites(t *testing.T) {
	fixtures := loadExplainFixtures(t)
	for _, tc := range []struct {
		name, regime string
		patterns     []string
		repeatDays   int // nodal days; 0 means no repeat claimed
		repeatRevs   int
		descending   float64 // local solar hours; 0 means not sun-synchronous
	}{
		{"ISS (ZARYA)", "LEO", nil, 0, 0, 0},
		{"NAVSTAR 75 (USA 265)", "MEO", nil, 1, 2, 0},
		{"GOES 18", "GEO", nil, 0, 0, 0},
		{"SENTINEL-2A", "LEO", []string{PatternRetrograde, PatternSunSynchronous}, 10, 143, 10.5},
		{"LANDSAT 9", "LEO", []string{PatternRetrograde, PatternSunSynchronous}, 16, 233, 10.2},
		{"SENTINEL-1C", "LEO", []string{PatternRetrograde, PatternSunSynchronous, PatternDawnDusk}, 12, 175, 6},
		{"SENTINEL-6A", "LEO", nil, 10, 127, 0},
		{"SWOT", "LEO", nil, 21, 292, 0},
		{"JASON-3", "LEO", nil, 0, 0, 0},
		{"MOLNIYA 1-29", "Elliptical", []string{PatternMolniya}, 1, 2, 0},
		// A decayed Molniya: still eccentric and critically inclined, but no
		// longer a 12-hour orbit.
		{"MOLNIYA 2-9", "Elliptical", nil, 0, 0, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			r, ok := fixtures[tc.name]
			if !ok {
				t.Fatalf("fixture %q missing", tc.name)
			}
			e, err := Explain(r)
			if err != nil {
				t.Fatal(err)
			}
			if e.Regime != tc.regime {
				t.Errorf("regime = %s, want %s", e.Regime, tc.regime)
			}
			want := tc.patterns
			if want == nil {
				want = []string{}
			}
			if !reflect.DeepEqual(e.Patterns, want) {
				t.Errorf("patterns = %v, want %v", e.Patterns, want)
			}
			switch {
			case tc.repeatDays == 0 && e.RepeatGroundTrack != nil:
				t.Errorf("unexpected repeat %+v", *e.RepeatGroundTrack)
			case tc.repeatDays != 0 && (e.RepeatGroundTrack == nil || e.RepeatGroundTrack.NodalDays != tc.repeatDays || e.RepeatGroundTrack.Revolutions != tc.repeatRevs):
				t.Errorf("repeat = %+v, want %d days / %d orbits", e.RepeatGroundTrack, tc.repeatDays, tc.repeatRevs)
			}
			switch {
			case tc.descending == 0 && e.EquatorCrossingHours != nil:
				t.Errorf("unexpected equator time %v", *e.EquatorCrossingHours)
			case tc.descending != 0 && (e.EquatorCrossingHours == nil || math.Abs(*e.EquatorCrossingHours-tc.descending) > 0.1):
				t.Errorf("descending node = %v, want about %v", e.EquatorCrossingHours, tc.descending)
			}
			assertStatements(t, e)
		})
	}
}

func assertStatements(t *testing.T, e Explanation) {
	t.Helper()
	if len(e.Statements) == 0 || e.Statements[0].ID != "regime" {
		t.Fatalf("first statement should explain the regime: %+v", e.Statements)
	}
	seen := map[string]bool{}
	for _, s := range e.Statements {
		if s.Basis != BasisDerived && s.Basis != BasisHeuristic {
			t.Errorf("%s has basis %q", s.ID, s.Basis)
		}
		if seen[s.ID] {
			t.Errorf("duplicate statement %s", s.ID)
		}
		seen[s.ID] = true
		if strings.TrimSpace(s.Text) == "" || strings.Contains(s.Text, "%!") {
			t.Errorf("%s has malformed text %q", s.ID, s.Text)
		}
	}
}

func TestExplainTLEAndGPAgree(t *testing.T) {
	data, err := os.ReadFile("../../examples/tui-demo/iss.tle")
	if err != nil {
		t.Fatal(err)
	}
	tles, err := elements.ParseTLE(data, "25544")
	if err != nil || len(tles) == 0 {
		t.Fatal(err)
	}
	fromTLE, err := elements.FromTLE(tles[0])
	if err != nil {
		t.Fatal(err)
	}
	gp := fromTLE
	gp.SourceFormat, gp.LegacyTLE = "gp-json", nil
	a, err := Explain(fromTLE)
	if err != nil {
		t.Fatal(err)
	}
	b, err := Explain(gp)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(a, b) {
		t.Fatalf("TLE and GP explanations differ:\n%+v\n%+v", a, b)
	}
}

func TestExplainRejectsInvalidElements(t *testing.T) {
	if _, err := Explain(elements.Record{CatalogID: "1", MeanMotionRevDay: -1}); err == nil {
		t.Fatal("invalid elements explained")
	}
}

// synthetic builds a record from period, eccentricity and inclination.
func synthetic(periodMinutes, ecc, inc float64) elements.Record {
	return elements.Record{CatalogID: "99999", Epoch: time.Date(2026, 3, 20, 0, 0, 0, 0, time.UTC), SourceFormat: "gp-json",
		MeanMotionRevDay: 1440 / periodMinutes, Eccentricity: ecc, InclinationDeg: inc, ArgumentOfPerigeeDeg: 270}
}

func hasPattern(e Explanation, p string) bool {
	for _, got := range e.Patterns {
		if got == p {
			return true
		}
	}
	return false
}

func mustExplain(t *testing.T, r elements.Record) Explanation {
	t.Helper()
	e, err := Explain(r)
	if err != nil {
		t.Fatal(err)
	}
	assertStatements(t, e)
	return e
}

// sunSyncInclination returns the inclination whose nodal rate is offset from
// the Sun's rate by delta degrees per day, for a circular orbit.
func sunSyncInclination(t *testing.T, periodMinutes, delta float64) float64 {
	t.Helper()
	info, err := orbitInfo(0, 0, 1440/periodMinutes)
	if err != nil {
		t.Fatal(err)
	}
	node, _ := secularRates(info) // equals -k at zero inclination
	return math.Acos((sunSynchronousDegDay+delta)/node) * 180 / math.Pi
}

func TestExplainPatternBoundaries(t *testing.T) {
	const leo = 100.0 // minutes
	for _, tc := range []struct {
		name    string
		record  elements.Record
		pattern string
		want    bool
	}{
		{"sun-synchronous inside tolerance", synthetic(leo, 0.001, sunSyncInclination(t, leo, 0.029)), PatternSunSynchronous, true},
		{"sun-synchronous outside tolerance", synthetic(leo, 0.001, sunSyncInclination(t, leo, 0.031)), PatternSunSynchronous, false},
		{"sun-synchronous needs a near-circle", synthetic(leo, 0.1, sunSyncInclination(t, leo, 0)), PatternSunSynchronous, false},
		{"polar at 80 degrees", synthetic(leo, 0.001, 80), PatternPolar, true},
		{"not polar below 80 degrees", synthetic(leo, 0.001, 79.9), PatternPolar, false},
		{"polar retrograde at 100 degrees", synthetic(leo, 0.001, 100), PatternPolar, true},
		{"near-equatorial at 5 degrees", synthetic(leo, 0.001, 5), PatternNearEquatorial, true},
		{"not near-equatorial above 5 degrees", synthetic(leo, 0.001, 5.1), PatternNearEquatorial, false},
		{"retrograde above 90 degrees", synthetic(leo, 0.001, 90.1), PatternRetrograde, true},
		{"not retrograde at 90 degrees", synthetic(leo, 0.001, 90), PatternRetrograde, false},
		{"Molniya", synthetic(siderealDayMinutes/2, 0.7, 63.4), PatternMolniya, true},
		{"Molniya at period edge", synthetic(siderealDayMinutes/2*1.029, 0.7, 63.4), PatternMolniya, true},
		{"not Molniya past period edge", synthetic(siderealDayMinutes/2*1.031, 0.7, 63.4), PatternMolniya, false},
		{"Molniya at eccentricity edge", synthetic(siderealDayMinutes/2, 0.5, 63.4), PatternMolniya, true},
		{"not Molniya when too round", synthetic(siderealDayMinutes/2, 0.49, 63.4), PatternMolniya, false},
		{"Molniya at inclination edge", synthetic(siderealDayMinutes/2, 0.7, 66.4), PatternMolniya, true},
		{"not Molniya off the critical inclination", synthetic(siderealDayMinutes/2, 0.7, 66.5), PatternMolniya, false},
		{"Tundra", synthetic(siderealDayMinutes, 0.27, 63.4), PatternTundra, true},
		{"Tundra at eccentricity floor", synthetic(siderealDayMinutes, 0.15, 63.4), PatternTundra, true},
		{"not Tundra when too round", synthetic(siderealDayMinutes, 0.14, 63.4), PatternTundra, false},
		{"not Tundra when too stretched", synthetic(siderealDayMinutes, 0.51, 63.4), PatternTundra, false},
		{"not Tundra off a sidereal day", synthetic(siderealDayMinutes*1.011, 0.27, 63.4), PatternTundra, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if got := hasPattern(mustExplain(t, tc.record), tc.pattern); got != tc.want {
				t.Fatalf("%s = %v, want %v", tc.pattern, got, tc.want)
			}
		})
	}
}

func TestExplainTundraAndMolniyaHemisphere(t *testing.T) {
	north := mustExplain(t, synthetic(siderealDayMinutes, 0.27, 63.4))
	if north.Regime != "GSO" || !strings.Contains(statement(north, "tundra"), "far north") {
		t.Fatalf("Tundra: %+v", north)
	}
	south := synthetic(siderealDayMinutes/2, 0.7, 63.4)
	south.ArgumentOfPerigeeDeg = 90
	if text := statement(mustExplain(t, south), "molniya"); !strings.Contains(text, "far south") {
		t.Fatalf("southern Molniya: %q", text)
	}
}

func TestExplainSunSynchronousCrossingTimes(t *testing.T) {
	epoch := time.Date(2026, 3, 20, 12, 0, 0, 0, time.UTC)
	days := epoch.Sub(j2000).Hours() / 24
	meanSun := math.Mod(280.460+0.9856474*days, 360)
	for _, tc := range []struct {
		descending float64
		dawnDusk   bool
		phrase     string
	}{
		{10.5, false, "heading south at about 10:30"},
		{22.5, false, "heading north at about 10:30"},
		{13.5, false, "heading south at about 13:30"},
		{6, true, "06:00 and 18:00"},
		{17.25, true, "17:15 and 05:15"},
		{8.9, false, "heading south at about 08:55"},
	} {
		r := synthetic(100, 0.001, sunSyncInclination(t, 100, 0))
		r.Epoch = epoch
		ascending := math.Mod(tc.descending+12, 24)
		r.RAANDeg = math.Mod(meanSun+(ascending-12)*15+720, 360)
		e := mustExplain(t, r)
		if got := hasPattern(e, PatternDawnDusk); got != tc.dawnDusk {
			t.Errorf("%v: dawn-dusk = %v", tc.descending, got)
		}
		if text := statement(e, "equator_time"); !strings.Contains(text, tc.phrase) {
			t.Errorf("%v: %q lacks %q", tc.descending, text, tc.phrase)
		}
	}
}

func TestExplainWording(t *testing.T) {
	iss := mustExplain(t, loadExplainFixtures(t)["ISS (ZARYA)"])
	if got := statement(iss, "pace"); got != "It circles Earth about 15.5 times a day, once every 93 minutes." {
		t.Errorf("ISS pace = %q", got)
	}
	if got := statement(iss, "reach"); !strings.Contains(got, "up to 52° north and south") {
		t.Errorf("ISS reach = %q", got)
	}
	gps := mustExplain(t, loadExplainFixtures(t)["NAVSTAR 75 (USA 265)"])
	if got := statement(gps, "repeat"); got != "Its path over the ground repeats every 23 h 56 min, after 2 orbits." {
		t.Errorf("GPS repeat = %q", got)
	}
	geo := mustExplain(t, loadExplainFixtures(t)["GOES 18"])
	if statement(geo, "pace") != "" || statement(geo, "reach") != "" || statement(geo, "repeat") != "" {
		t.Errorf("GEO should only explain its regime: %+v", geo.Statements)
	}
	slow := mustExplain(t, synthetic(3*1440, 0, 10))
	if got := statement(slow, "pace"); got != "One trip around Earth takes 3 days." {
		t.Errorf("slow pace = %q", got)
	}
}

func statement(e Explanation, id string) string {
	for _, s := range e.Statements {
		if s.ID == id {
			return s.Text
		}
	}
	return ""
}

func TestHelpers(t *testing.T) {
	for in, want := range map[float64]string{0: "0", 999: "999", 1000: "1,000", 38657.4: "38,657", 1234567: "1,234,567"} {
		if got := thousands(in); got != want {
			t.Errorf("thousands(%v) = %q, want %q", in, got, want)
		}
	}
	for in, want := range map[float64]string{93.2: "93 minutes", 718: "11 h 58 min", 1440: "24 hours", 4320: "3 days", 14400: "10 days"} {
		if got := duration(in); got != want {
			t.Errorf("duration(%v) = %q, want %q", in, got, want)
		}
	}
	for in, want := range map[float64]string{10.5: "10:30", 23.99: "00:00", 6.05: "06:05", 6.04: "06:00", 0: "00:00"} {
		if got := clock(in); got != want {
			t.Errorf("clock(%v) = %q, want %q", in, got, want)
		}
	}
}

func TestExplainRegimeBasis(t *testing.T) {
	fixtures := loadExplainFixtures(t)
	for name, want := range map[string]string{"ISS (ZARYA)": BasisDerived, "NAVSTAR 75 (USA 265)": BasisDerived, "MOLNIYA 1-29": BasisDerived, "GOES 18": BasisHeuristic} {
		if got := mustExplain(t, fixtures[name]).Statements[0].Basis; got != want {
			t.Errorf("%s regime basis = %s, want %s", name, got, want)
		}
	}
}
