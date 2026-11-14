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
	sso := []string{PatternSunSynchronous, PatternRetrograde}
	dawnDusk := []string{PatternSunSynchronous, PatternDawnDusk, PatternRetrograde}
	// Published values these are checked against:
	//   Sentinel-1: 18:00 ascending node, 12 days, 175 orbits  https://sentiwiki.copernicus.eu/web/s1-mission
	//   Sentinel-2: 10:30 descending node, 10 days, 143 orbits https://sentiwiki.copernicus.eu/web/s2-mission
	//   Sentinel-3: 10:00 descending node, 27 days, 385 orbits https://sentiwiki.copernicus.eu/web/s3-mission
	//   Landsat 9: 10:12 ±5 min, 16-day repeat                 https://www.usgs.gov/landsat-missions/landsat-9
	//   Landsat 8: 10:12 ±5 min, 16-day repeat                 https://www.usgs.gov/landsat-missions/landsat-8
	//   TerraSAR-X: 18:00 ascending node, 11 days, 167 orbits  https://www.eoportal.org/satellite-missions/terrasar-x
	//   QZS-2: quasi-zenith (inclined geosynchronous) orbit    https://qzss.go.jp/en/overview/services/sv02_why.html
	//   Molniya: 12 hours, 63.4°, high latitudes               https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/
	//   Sentinel-6: 9.9156 days, 127 orbits  https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/sentinel-6-jason-cs
	//   SWOT: 20.86455 days, 292 orbits      https://www.aviso.altimetry.fr/en/missions/current-missions/swot/orbit/science-orbit.html
	//   GPS: twice a day                     https://www.gps.gov/space-segment
	//   Terra: drifting earlier since 2022   https://www.earthdata.nasa.gov/data/alerts-outages/terra-satellite-drift-affects-mopitt
	for _, tc := range []struct {
		name, regime string
		patterns     []string
		repeatDays   int // nodal days; 0 means no repeat claimed
		repeatRevs   int
		descending   float64 // local mean solar hours; 0 means not sun-synchronous
		extra        string  // a statement ID that must be present
	}{
		{"ISS (ZARYA)", "LEO", nil, 0, 0, 0, ""},
		{"NAVSTAR 75 (USA 265)", "MEO", nil, 1, 2, 0, ""},
		{"GOES 18", "GEO", nil, 0, 0, 0, ""},
		{"SENTINEL-2A", "LEO", sso, 10, 143, 10.5, ""},
		{"LANDSAT 9", "LEO", sso, 16, 233, 10.2, ""},
		{"LANDSAT 8", "LEO", sso, 16, 233, 10.2, ""},
		{"SENTINEL-3A", "LEO", sso, 27, 385, 10, ""},
		{"SENTINEL-1C", "LEO", dawnDusk, 12, 175, 6, ""},
		{"TERRASAR-X", "LEO", dawnDusk, 11, 167, 6, ""},
		{"TERRA", "LEO", sso, 0, 0, 8.56, "sun_sync_drift"},
		{"SENTINEL-6A", "LEO", nil, 10, 127, 0, ""},
		{"SWOT", "LEO", nil, 21, 292, 0, ""},
		{"JASON-3", "LEO", nil, 0, 0, 0, ""},
		{"MOLNIYA 1-29", "Elliptical", []string{PatternMolniya}, 1, 2, 0, "molniya"},
		// A decayed Molniya: still eccentric and critically inclined, but no
		// longer a 12-hour orbit.
		{"MOLNIYA 2-9", "Elliptical", nil, 0, 0, 0, "shape"},
		// An inclined geosynchronous navigation satellite.
		{"QZS-2 (MICHIBIKI-2)", "GSO", nil, 1, 1, 0, ""},
	} {
		t.Run(tc.name, func(t *testing.T) {
			r, ok := fixtures[tc.name]
			if !ok {
				t.Fatalf("fixture %q missing", tc.name)
			}
			e := mustExplain(t, r)
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
			if tc.extra != "" && statement(e, tc.extra) == "" {
				t.Errorf("missing %s statement: %+v", tc.extra, e.Statements)
			}
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
		if strings.TrimSpace(s.Text) == "" || strings.Contains(s.Text, "%!") || strings.Contains(s.Text, " 1 orbits") {
			t.Errorf("%s has malformed text %q", s.ID, s.Text)
		}
		if len(s.Sources) == 0 {
			t.Errorf("%s has no source", s.ID)
		}
		for _, src := range s.Sources {
			if src.Label == "" || src.Title == "" || !strings.HasPrefix(src.URL, "https://") {
				t.Errorf("%s has an incomplete source %+v", s.ID, src)
			}
		}
	}
	if e.EquatorCrossingHours != nil && (*e.EquatorCrossingHours < 0 || *e.EquatorCrossingHours >= 24) {
		t.Errorf("equator time %v outside [0, 24)", *e.EquatorCrossingHours)
	}
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
	if a, b := mustExplain(t, fromTLE), mustExplain(t, gp); !reflect.DeepEqual(a, b) {
		t.Fatalf("TLE and GP explanations differ:\n%+v\n%+v", a, b)
	}
}

func TestExplainRejectsInvalidElements(t *testing.T) {
	if _, err := Explain(elements.Record{CatalogID: "1", MeanMotionRevDay: -1}); err == nil {
		t.Fatal("invalid elements explained")
	}
}

var syntheticEpoch = time.Date(2026, 3, 20, 12, 0, 0, 0, time.UTC)

// orbitCase drives explain directly, so tests can set the secular rates
// precisely instead of searching for elements that produce them.
type orbitCase struct {
	period, ecc, inc float64
	node             float64 // degrees per day
	argPerigee, raan float64
	resonant         bool
}

func (c orbitCase) explain(t *testing.T) Explanation {
	t.Helper()
	info, err := orbitInfo(c.inc, c.ecc, 1440/c.period)
	if err != nil {
		t.Fatal(err)
	}
	e := explain(info, rates{nodeDegDay: c.node, draconicRevDay: 1440 / c.period, resonant: c.resonant}, c.raan, c.argPerigee, syntheticEpoch)
	assertStatements(t, e)
	return e
}

func hasPattern(e Explanation, p string) bool {
	for _, got := range e.Patterns {
		if got == p {
			return true
		}
	}
	return false
}

func statement(e Explanation, id string) string {
	for _, s := range e.Statements {
		if s.ID == id {
			return s.Text
		}
	}
	return ""
}

func TestExplainPatternBoundaries(t *testing.T) {
	const leo, half, day = 100.0, siderealDayMinutes / 2, siderealDayMinutes
	sun := sunSynchronousDegDay
	for _, tc := range []struct {
		name    string
		c       orbitCase
		pattern string
		want    bool
	}{
		{"sun-synchronous inside tolerance", orbitCase{period: leo, ecc: .001, inc: 98, node: sun + .029}, PatternSunSynchronous, true},
		{"sun-synchronous inside tolerance below", orbitCase{period: leo, ecc: .001, inc: 98, node: sun - .029}, PatternSunSynchronous, true},
		{"sun-synchronous outside tolerance", orbitCase{period: leo, ecc: .001, inc: 98, node: sun + .031}, PatternSunSynchronous, false},
		{"sun-synchronous needs a near-circle", orbitCase{period: leo, ecc: .1, inc: 98, node: sun}, PatternSunSynchronous, false},
		{"polar at 80 degrees", orbitCase{period: leo, ecc: .001, inc: 80, node: -1}, PatternPolar, true},
		{"not polar below 80 degrees", orbitCase{period: leo, ecc: .001, inc: 79.9, node: -1}, PatternPolar, false},
		{"polar retrograde at 100 degrees", orbitCase{period: leo, ecc: .001, inc: 100, node: 1.5}, PatternPolar, true},
		{"near-equatorial at 5 degrees", orbitCase{period: leo, ecc: .001, inc: 5, node: -7}, PatternNearEquatorial, true},
		{"not near-equatorial above 5 degrees", orbitCase{period: leo, ecc: .001, inc: 5.1, node: -7}, PatternNearEquatorial, false},
		{"near-equatorial retrograde", orbitCase{period: leo, ecc: .001, inc: 176, node: 7}, PatternNearEquatorial, true},
		{"retrograde above 90 degrees", orbitCase{period: leo, ecc: .001, inc: 90.1, node: 0}, PatternRetrograde, true},
		{"not retrograde at 90 degrees", orbitCase{period: leo, ecc: .001, inc: 90, node: 0}, PatternRetrograde, false},
		{"Molniya", orbitCase{period: half, ecc: .7, inc: 63.4, argPerigee: 270}, PatternMolniya, true},
		{"Molniya at period edge", orbitCase{period: half * 1.029, ecc: .7, inc: 63.4, argPerigee: 270}, PatternMolniya, true},
		{"not Molniya past period edge", orbitCase{period: half * 1.031, ecc: .7, inc: 63.4, argPerigee: 270}, PatternMolniya, false},
		{"Molniya at eccentricity edge", orbitCase{period: half, ecc: .5, inc: 63.4, argPerigee: 270}, PatternMolniya, true},
		{"not Molniya when too round", orbitCase{period: half, ecc: .49, inc: 63.4, argPerigee: 270}, PatternMolniya, false},
		{"Molniya at inclination edge", orbitCase{period: half, ecc: .7, inc: 66.4, argPerigee: 270}, PatternMolniya, true},
		{"not Molniya off the critical inclination", orbitCase{period: half, ecc: .7, inc: 66.5, argPerigee: 270}, PatternMolniya, false},
		{"Tundra", orbitCase{period: day, ecc: .27, inc: 63.4, argPerigee: 270}, PatternTundra, true},
		{"Tundra at eccentricity floor", orbitCase{period: day, ecc: .15, inc: 63.4, argPerigee: 270}, PatternTundra, true},
		{"not Tundra when too round", orbitCase{period: day, ecc: .14, inc: 63.4, argPerigee: 270}, PatternTundra, false},
		{"not Tundra when too stretched", orbitCase{period: day, ecc: .51, inc: 63.4, argPerigee: 270}, PatternTundra, false},
		{"not Tundra off a sidereal day", orbitCase{period: day * 1.011, ecc: .27, inc: 63.4, argPerigee: 270}, PatternTundra, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if got := hasPattern(tc.c.explain(t), tc.pattern); got != tc.want {
				t.Fatalf("%s = %v, want %v", tc.pattern, got, tc.want)
			}
		})
	}
}

func TestExplainPatternOrderPutsNamedPatternsFirst(t *testing.T) {
	e := orbitCase{period: 100, ecc: .001, inc: 98, node: sunSynchronousDegDay}.explain(t)
	if !reflect.DeepEqual(e.Patterns, []string{PatternSunSynchronous, PatternRetrograde}) {
		t.Fatalf("patterns = %v", e.Patterns)
	}
}

func TestExplainApogeeHemisphere(t *testing.T) {
	half := siderealDayMinutes / 2
	for _, tc := range []struct {
		argPerigee float64
		want       string
	}{
		{270, "high over the far north"},
		{90, "high over the far south"},
		{0, "high above its far point"}, // apogee on the equator
		{180, "high above its far point"},
		{225, "high over the far north"}, // |sin(ω+180°)| ≈ 0.707
	} {
		text := statement(orbitCase{period: half, ecc: .7, inc: 63.4, argPerigee: tc.argPerigee}.explain(t), "molniya")
		if !strings.Contains(text, tc.want) {
			t.Errorf("ω=%v: %q lacks %q", tc.argPerigee, text, tc.want)
		}
	}
	tundra := orbitCase{period: siderealDayMinutes, ecc: .27, inc: 63.4, argPerigee: 270}.explain(t)
	if tundra.Regime != "GSO" || !strings.Contains(statement(tundra, "tundra"), "in the far north") {
		t.Fatalf("Tundra: %+v", tundra)
	}
}

func TestExplainSunSynchronousCrossingTimes(t *testing.T) {
	days := syntheticEpoch.Sub(j2000).Hours() / 24
	meanSun := math.Mod(280.460+0.9856474*days, 360)
	raanFor := func(descending float64) float64 {
		ascending := math.Mod(descending+12, 24)
		return math.Mod(meanSun+(ascending-12)*15+720, 360)
	}
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
		e := orbitCase{period: 100, ecc: .001, inc: 98, node: sunSynchronousDegDay, raan: raanFor(tc.descending)}.explain(t)
		if got := hasPattern(e, PatternDawnDusk); got != tc.dawnDusk {
			t.Errorf("%v: dawn-dusk = %v", tc.descending, got)
		}
		if text := statement(e, "equator_time"); !strings.Contains(text, tc.phrase) {
			t.Errorf("%v: %q lacks %q", tc.descending, text, tc.phrase)
		}
	}
	// Rounding just below midnight must wrap to 0, not report 24.
	e := orbitCase{period: 100, ecc: .001, inc: 98, node: sunSynchronousDegDay, raan: raanFor(23.996)}.explain(t)
	if e.EquatorCrossingHours == nil || *e.EquatorCrossingHours != 0 {
		t.Fatalf("23.996 h rounds to %v, want 0", e.EquatorCrossingHours)
	}
}

func TestExplainDrift(t *testing.T) {
	sun := sunSynchronousDegDay
	if text := statement(orbitCase{period: 100, ecc: .001, inc: 98, node: sun - .027}.explain(t), "sun_sync_drift"); !strings.Contains(text, "about 39 minutes earlier each year") {
		t.Errorf("sun-synchronous drift = %q", text)
	}
	if text := statement(orbitCase{period: 100, ecc: .001, inc: 98, node: sun + .005}.explain(t), "sun_sync_drift"); text != "" {
		t.Errorf("a 7 min/yr drift should not be mentioned: %q", text)
	}
	held := orbitCase{period: siderealDayMinutes, inc: 0.05}.explain(t)
	if !strings.Contains(statement(held, "regime"), "hangs over one longitude") {
		t.Errorf("station-kept GEO: %q", statement(held, "regime"))
	}
	drifting := orbitCase{period: siderealDayMinutes * 1.009, inc: 0.05}.explain(t)
	if drifting.Regime != "GEO" || !strings.Contains(statement(drifting, "regime"), "drifts about 3.2° west a day") {
		t.Errorf("drifting GEO: %q", statement(drifting, "regime"))
	}
	gso := orbitCase{period: siderealDayMinutes / 1.004, inc: 10}.explain(t)
	if !strings.Contains(statement(gso, "drift"), "drifts about 1.4° east a day") {
		t.Errorf("drifting GSO: %+v", gso.Statements)
	}
}

func TestExplainWording(t *testing.T) {
	fixtures := loadExplainFixtures(t)
	iss := mustExplain(t, fixtures["ISS (ZARYA)"])
	if got := statement(iss, "pace"); got != "It circles Earth about 15.5 times a day, once every 93 minutes." {
		t.Errorf("ISS pace = %q", got)
	}
	if got := statement(iss, "reach"); !strings.Contains(got, "up to 52° north and south") {
		t.Errorf("ISS reach = %q", got)
	}
	gps := mustExplain(t, fixtures["NAVSTAR 75 (USA 265)"])
	if got := statement(gps, "repeat"); got != "Its path over the ground repeats every 23 h 56 min, after 2 orbits." {
		t.Errorf("GPS repeat = %q", got)
	}
	qzs := mustExplain(t, fixtures["QZS-2 (MICHIBIKI-2)"])
	if got := statement(qzs, "repeat"); got != "Its path over the ground repeats every 23 h 56 min, after one orbit." {
		t.Errorf("QZS repeat = %q", got)
	}
	geo := mustExplain(t, fixtures["GOES 18"])
	if statement(geo, "pace") != "" || statement(geo, "reach") != "" || statement(geo, "repeat") != "" {
		t.Errorf("GEO should only explain its regime: %+v", geo.Statements)
	}
	if got := statement(orbitCase{period: 3 * 1440, inc: 10}.explain(t), "pace"); got != "One trip around Earth takes 3 days." {
		t.Errorf("slow pace = %q", got)
	}
	retro := statement(orbitCase{period: 100, ecc: .001, inc: 176, node: 7}.explain(t), "reach")
	if strings.Contains(retro, "only") || !strings.Contains(retro, "runs backwards") || !strings.Contains(retro, "4° north or south") {
		t.Errorf("retrograde equatorial reach = %q", retro)
	}
	if got := statement(orbitCase{period: 100, ecc: .001, inc: 80, node: -1}.explain(t), "polar"); !strings.Contains(got, "within 10° of both poles") || !strings.Contains(got, "nearly all") {
		t.Errorf("polar = %q", got)
	}
	decayed := orbitCase{period: 5000, ecc: .98, inc: 50}.explain(t)
	if statement(decayed, "shape") != "" || !strings.Contains(statement(decayed, "reentry"), "below Earth's surface") {
		t.Errorf("below-surface perigee: %+v", decayed.Statements)
	}
	sso := statement(orbitCase{period: 100, ecc: .001, inc: 98, node: sunSynchronousDegDay}.explain(t), "sun_synchronous")
	if strings.Contains(sso, "passes over each place") || !strings.Contains(sso, "whenever it crosses the equator heading the same way") {
		t.Errorf("sun-synchronous wording = %q", sso)
	}
}

func TestHelpers(t *testing.T) {
	for in, want := range map[float64]string{0: "0", 999: "999", 1000: "1,000", 38657.4: "38,657", 1234567: "1,234,567", -4441: "-4,441"} {
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
	if orbits(1) != "one orbit" || orbits(2) != "2 orbits" {
		t.Error("orbits() pluralises wrongly")
	}
}
