package orbit

import (
	"math"
	"strconv"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
)

func TestObserverValidateBoundsAndFiniteValues(t *testing.T) {
	for _, o := range []Observer{{Lat: -90, Lon: 180, Alt: 0}, {Lat: 90, Lon: -180, Alt: -6378.136}} {
		if err := o.Validate(); err != nil {
			t.Errorf("valid observer %+v: %v", o, err)
		}
	}
	for _, o := range []Observer{{Lat: math.NaN()}, {Lat: 90.1}, {Lon: math.Inf(1)}, {Lon: -180.1}, {Alt: -6378.137}} {
		if err := o.Validate(); err == nil {
			t.Errorf("invalid observer %+v validated", o)
		}
	}
}

func TestOrbitEstimatesAgainstKeplerReferences(t *testing.T) {
	// Independently calculated with 50-digit Python Decimal arithmetic from
	// chosen a/e values, not SGP4 extrema. See docs/orbit-estimates.md.
	for _, tc := range []struct {
		name, class                               string
		motion, ecc, inc, period, perigee, apogee float64
	}{
		{"low circularish", "LEO", 14.823668760136153, .01, 51.6, 97.14194396143359, 551.863, 691.863},
		{"Molniya crosses bands", "Other", 2.005675437459987, .74, 63.4, 717.962624014399, 527.463, 39836.263},
		{"stationary candidate", "GEO", 1.002743960677476, 0, 0, 1436.0595091763047, 35785.863, 35785.863},
		{"inclined synchronous", "GSO", 1.002743960677476, 0, 20, 1436.0595091763047, 35785.863, 35785.863},
		{"high eccentric", "HEO", .7765112560163497, .1, 10, 1854.448327494277, 38621.863, 48621.863},
		{"old false GEO", "HEO", .9094608139888118, 0, 0, 1583.355739852377, 38621.863, 38621.863},
	} {
		t.Run(tc.name, func(t *testing.T) {
			r := elements.Record{CatalogID: "25544", Epoch: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC), SourceFormat: "gp-json", MeanMotionRevDay: tc.motion, Eccentricity: tc.ecc, InclinationDeg: tc.inc}
			gp, err := OrbitInfoFromElements(r)
			if err != nil {
				t.Fatal(err)
			}
			legacy, err := OrbitInfoFromTLE(tle.TLE{Line2: tle.TLELine2{
				MeanMotion:   strconv.FormatFloat(tc.motion, 'g', -1, 64),
				Eccentricity: strconv.FormatFloat(tc.ecc, 'g', -1, 64),
				Inclination:  strconv.FormatFloat(tc.inc, 'g', -1, 64),
			}})
			if err != nil {
				t.Fatal(err)
			}
			if legacy != gp {
				t.Fatalf("TLE and GP disagree: %+v vs %+v", legacy, gp)
			}
			if gp.OrbitClass != tc.class {
				t.Errorf("class = %s, want %s", gp.OrbitClass, tc.class)
			}
			for _, metric := range []struct {
				name      string
				got, want float64
			}{
				{"period minutes", gp.PeriodMinutes, tc.period},
				{"perigee km", gp.PerigeeKm, tc.perigee},
				{"apogee km", gp.ApogeeKm, tc.apogee},
			} {
				if math.Abs(metric.got-metric.want) > 1e-6 {
					t.Errorf("%s = %.12f, want %.12f", metric.name, metric.got, metric.want)
				}
			}
		})
	}
}

func TestClassifyOrbitBoundaries(t *testing.T) {
	for _, tc := range []struct {
		name, want string
		orbit      OrbitInfo
	}{
		{"GEO shape tolerances included", "GEO", OrbitInfo{PeriodMinutes: 1440, InclinationDeg: 1, Eccentricity: .01}},
		{"period inside lower tolerance", "GEO", OrbitInfo{PeriodMinutes: 1421.708}},
		{"period outside lower tolerance", "MEO", OrbitInfo{PeriodMinutes: 1421.707, PerigeeKm: 30000, ApogeeKm: 35000}},
		{"period inside upper tolerance", "GEO", OrbitInfo{PeriodMinutes: 1450.428}},
		{"period outside upper tolerance", "HEO", OrbitInfo{PeriodMinutes: 1450.429, PerigeeKm: 36000, ApogeeKm: 38000}},
		{"inclination outside GEO", "GSO", OrbitInfo{PeriodMinutes: 1440, InclinationDeg: 1.001}},
		{"eccentricity outside GEO", "GSO", OrbitInfo{PeriodMinutes: 1440, Eccentricity: .01001}},
		{"retrograde equatorial", "GSO", OrbitInfo{PeriodMinutes: 1440, InclinationDeg: 180}},
		{"period too short", "MEO", OrbitInfo{PeriodMinutes: 1400, PerigeeKm: 30000, ApogeeKm: 35000}},
		{"period too long", "HEO", OrbitInfo{PeriodMinutes: 1500, PerigeeKm: 36000, ApogeeKm: 38000}},
		{"below LEO boundary", "LEO", OrbitInfo{PerigeeKm: 400, ApogeeKm: 1999.999}},
		{"crosses LEO boundary", "Other", OrbitInfo{PerigeeKm: 400, ApogeeKm: 2000}},
		{"MEO lower boundary", "MEO", OrbitInfo{PerigeeKm: 2000, ApogeeKm: 3000}},
		{"MEO upper boundary", "Other", OrbitInfo{PerigeeKm: 2000, ApogeeKm: 35786}},
		{"HEO lower boundary", "HEO", OrbitInfo{PerigeeKm: 35786, ApogeeKm: 40000}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if got := classify(tc.orbit); got != tc.want {
				t.Fatalf("class = %s, want %s", got, tc.want)
			}
		})
	}
}

func TestOrbitEstimatesRejectNumericalOverflow(t *testing.T) {
	for _, motion := range []float64{math.SmallestNonzeroFloat64, math.MaxFloat64} {
		r := elements.Record{CatalogID: "25544", Epoch: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC), SourceFormat: "gp-json", MeanMotionRevDay: motion}
		if _, err := OrbitInfoFromElements(r); err == nil {
			t.Fatalf("GP accepted unrepresentable motion %g", motion)
		}
		if _, err := OrbitInfoFromTLE(tle.TLE{Line2: tle.TLELine2{Inclination: "0", Eccentricity: "0", MeanMotion: strconv.FormatFloat(motion, 'g', -1, 64)}}); err == nil {
			t.Fatalf("TLE accepted unrepresentable motion %g", motion)
		}
	}
}

func TestValidateStateRejectsNonFinitePropagation(t *testing.T) {
	if err := ValidateState(State{PositionTEMEKm: structVector(math.NaN(), 0, 0)}); err == nil {
		t.Fatal("ValidateState accepted a non-finite position")
	}
}

func structVector(x, y, z float64) satellite.Vector3 { return satellite.Vector3{X: x, Y: y, Z: z} }

func TestPlanPassesRejectsUnsafeBudgetsBeforePropagation(t *testing.T) {
	for _, tc := range []struct {
		name           string
		duration, step time.Duration
	}{
		{"too long", 31 * 24 * time.Hour, time.Minute},
		{"subsecond step", time.Hour, time.Millisecond},
		{"too many samples", 30 * 24 * time.Hour, time.Second},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if _, err := PlanPasses(satellite.Satellite{}, Observer{}, time.Time{}, tc.duration, tc.step); err == nil {
				t.Fatal("PlanPasses accepted unsafe budget")
			}
		})
	}
}
