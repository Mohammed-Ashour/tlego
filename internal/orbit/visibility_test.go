package orbit

import (
	"context"
	"math"
	"path/filepath"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
)

var greenwich = Observer{Lat: 51.48, Lon: 0}

func issPropagator(t *testing.T) *Propagator {
	t.Helper()
	records, err := catalog.ReadElements(filepath.Join("..", "..", "examples", "tui-demo", "iss.tle"))
	if err != nil {
		t.Fatal(err)
	}
	prop, err := New(records[0])
	if err != nil {
		t.Fatal(err)
	}
	return prop
}

func parseUTC(t *testing.T, value string) time.Time {
	t.Helper()
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		t.Fatal(err)
	}
	return parsed
}

func angleDiff(a, b float64) float64 {
	return math.Abs(math.Mod(a-b+540, 360) - 180)
}

func TestPassesMatchSkyfield(t *testing.T) {
	const timeTolerance, angleTolerance = 2 * time.Second, 0.1
	start := parseUTC(t, "2026-10-24T05:01:11Z")
	passes, err := PlanPassesElements(issPropagator(t), greenwich, start, 24*time.Hour, time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	if len(passes) != len(skyfieldPasses) {
		t.Fatalf("got %d passes, want %d", len(passes), len(skyfieldPasses))
	}
	near := func(name string, got time.Time, want string) {
		t.Helper()
		if diff := got.Sub(parseUTC(t, want)).Abs(); diff > timeTolerance {
			t.Errorf("%s = %s, want %s (off by %s)", name, got.Format(time.RFC3339), want, diff)
		}
	}
	for i, want := range skyfieldPasses {
		got := passes[i]
		near("rise", got.Start, want.rise)
		near("peak", got.MaxTime, want.peak)
		near("set", got.End, want.set)
		if diff := math.Abs(got.MaxElevationDeg - want.peakElevation); diff > angleTolerance {
			t.Errorf("pass %d peak elevation = %.3f, want %.3f", i, got.MaxElevationDeg, want.peakElevation)
		}
		if want.peakElevation < 80 && angleDiff(got.MaxAzimuthDeg, want.peakAzimuth) > 1 {
			t.Errorf("pass %d peak azimuth = %.3f, want %.3f", i, got.MaxAzimuthDeg, want.peakAzimuth)
		}
		if diff := angleDiff(got.StartAzimuthDeg, want.riseAzimuth); diff > 0.5 {
			t.Errorf("pass %d rise azimuth = %.3f, want %.3f", i, got.StartAzimuthDeg, want.riseAzimuth)
		}
		if diff := angleDiff(got.EndAzimuthDeg, want.setAzimuth); diff > 0.5 {
			t.Errorf("pass %d set azimuth = %.3f, want %.3f", i, got.EndAzimuthDeg, want.setAzimuth)
		}
	}
}

func TestSunElevationMatchesSkyfield(t *testing.T) {
	for _, want := range skyfieldSunElevations {
		got := SunElevationDeg(want.lat, want.lon, parseUTC(t, want.at))
		// Skyfield applies no refraction here, but uses geodetic zenith and apparent positions.
		if diff := math.Abs(got - want.elevation); diff > 0.25 {
			t.Errorf("%s at %.2f,%.2f: elevation = %.3f, want %.3f", want.at, want.lat, want.lon, got, want.elevation)
		}
	}
}

func TestEarthShadowMatchesSkyfield(t *testing.T) {
	prop := issPropagator(t)
	mismatches := 0
	for _, want := range skyfieldSunlitSamples {
		at := parseUTC(t, want.at)
		state, err := prop.At(at)
		if err != nil {
			t.Fatal(err)
		}
		if lit := !InEarthShadow(state.PositionTEMEKm, SunPositionKm(at)); lit != want.sunlit {
			mismatches++
		}
	}
	// The cylinder has no penumbra, so samples at the shadow boundary may differ.
	if limit := len(skyfieldSunlitSamples) / 50; mismatches > limit {
		t.Fatalf("%d of %d samples disagree, limit %d", mismatches, len(skyfieldSunlitSamples), limit)
	}
}

func TestInEarthShadowGeometry(t *testing.T) {
	sun := satellite.Vector3{X: astronomicalUnitKm}
	for _, tc := range []struct {
		name     string
		position satellite.Vector3
		want     bool
	}{
		{"sunward", satellite.Vector3{X: 6800}, false},
		{"directly behind Earth", satellite.Vector3{X: -6800}, true},
		{"behind and inside the cylinder", satellite.Vector3{X: -40000, Y: 6000}, true},
		{"behind and beyond the cylinder", satellite.Vector3{X: -40000, Y: 7000}, false},
		{"beside Earth", satellite.Vector3{Y: 6800}, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if got := InEarthShadow(tc.position, sun); got != tc.want {
				t.Fatalf("InEarthShadow() = %t, want %t", got, tc.want)
			}
		})
	}
}

func TestCompassPoint(t *testing.T) {
	for azimuth, want := range map[float64]string{0: "N", 11.24: "N", 11.26: "NNE", 90: "E", 180: "S", 270: "W", 348.8: "N", 359.9: "N", -90: "W", 450: "E"} {
		if got := CompassPoint(azimuth); got != want {
			t.Errorf("CompassPoint(%v) = %s, want %s", azimuth, got, want)
		}
	}
}

func TestNextDarkWindow(t *testing.T) {
	noon := parseUTC(t, "2026-10-24T12:00:00Z")
	window, ok, err := NextDarkWindow(greenwich, noon, 24*time.Hour, -6)
	if err != nil || !ok || window.Clipped {
		t.Fatalf("window=%+v ok=%t err=%v", window, ok, err)
	}
	for name, at := range map[string]time.Time{"start": window.Start, "end": window.End} {
		if elevation := SunElevationDeg(greenwich.Lat, greenwich.Lon, at); math.Abs(elevation+6) > 0.3 {
			t.Errorf("%s elevation = %.3f, want about -6", name, elevation)
		}
	}
	if !window.Start.After(noon) || !window.End.After(window.Start) {
		t.Fatalf("window out of order: %+v", window)
	}

	midnight := parseUTC(t, "2026-10-24T23:00:00Z")
	if window, _, _ = NextDarkWindow(greenwich, midnight, 24*time.Hour, -6); !window.Start.Equal(midnight) {
		t.Fatalf("already-dark window starts at %s", window.Start)
	}

	arcticSummer := Observer{Lat: 78, Lon: 15}
	if _, ok, err := NextDarkWindow(arcticSummer, parseUTC(t, "2026-06-21T00:00:00Z"), 24*time.Hour, -6); ok || err != nil {
		t.Fatalf("midnight sun: ok=%t err=%v", ok, err)
	}
	arcticWinter := parseUTC(t, "2026-12-21T00:00:00Z")
	if window, ok, _ := NextDarkWindow(arcticSummer, arcticWinter, 24*time.Hour, -6); !ok || !window.Clipped {
		t.Fatalf("polar night: ok=%t window=%+v", ok, window)
	}
	if _, _, err := NextDarkWindow(Observer{Lat: 91}, noon, time.Hour, -6); err == nil {
		t.Fatal("accepted an invalid observer")
	}
}

func TestPlanVisiblePassesFollowsCriteria(t *testing.T) {
	prop := issPropagator(t)
	start := parseUTC(t, "2026-10-24T05:01:11Z")
	criteria := DefaultVisibility()
	visible, err := PlanVisiblePasses(context.Background(), prop, greenwich, start, 24*time.Hour, criteria)
	if err != nil {
		t.Fatal(err)
	}
	if len(visible) == 0 {
		t.Fatal("expected a visible pass from this fixture")
	}
	for _, pass := range visible {
		for _, point := range []LookPoint{pass.Start, pass.Peak, pass.End} {
			if point.ElevationDeg < criteria.MinElevationDeg {
				t.Errorf("elevation %.2f below limit at %s", point.ElevationDeg, point.Time)
			}
			if sun := SunElevationDeg(greenwich.Lat, greenwich.Lon, point.Time); sun > criteria.MaxSunElevationDeg {
				t.Errorf("Sun at %.2f during a visible point at %s", sun, point.Time)
			}
			state, err := prop.At(point.Time)
			if err != nil {
				t.Fatal(err)
			}
			if InEarthShadow(state.PositionTEMEKm, SunPositionKm(point.Time)) {
				t.Errorf("satellite in shadow at %s", point.Time)
			}
		}
		if pass.Start.Time.After(pass.Peak.Time) || pass.Peak.Time.After(pass.End.Time) {
			t.Errorf("out of order: %+v", pass)
		}
	}
	none, err := PlanVisiblePasses(context.Background(), prop, greenwich, start, 24*time.Hour, Visibility{MinElevationDeg: 89.9, MaxSunElevationDeg: -6})
	if err != nil || len(none) != 0 {
		t.Fatalf("near-zenith criteria: %d passes, err=%v", len(none), err)
	}
	for _, bad := range []Visibility{{MinElevationDeg: -1, MaxSunElevationDeg: -6}, {MinElevationDeg: 90, MaxSunElevationDeg: -6}, {MinElevationDeg: 10, MaxSunElevationDeg: 1}, {MinElevationDeg: math.NaN()}} {
		if _, err := PlanVisiblePasses(context.Background(), prop, greenwich, start, time.Hour, bad); err == nil {
			t.Errorf("accepted criteria %+v", bad)
		}
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := PlanVisiblePasses(ctx, prop, greenwich, start, time.Hour, criteria); err == nil {
		t.Error("ignored a canceled context")
	}
}

func TestPassTrackIncludesEndsInOrder(t *testing.T) {
	prop := issPropagator(t)
	start := parseUTC(t, "2026-10-24T05:01:11Z")
	passes, err := PlanPassesElements(prop, greenwich, start, 3*time.Hour, time.Minute)
	if err != nil || len(passes) == 0 {
		t.Fatalf("passes=%d err=%v", len(passes), err)
	}
	track, err := PassTrack(prop, greenwich, passes[0], 20)
	if err != nil {
		t.Fatal(err)
	}
	if len(track) != 20 || !track[0].Time.Equal(passes[0].Start) || !track[19].Time.Equal(passes[0].End) {
		t.Fatalf("track has %d points from %s to %s", len(track), track[0].Time, track[19].Time)
	}
}
