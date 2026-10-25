package orbit

import (
	"math"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	satelliteTLE "github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

const (
	issLine1 = "1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927"
	issLine2 = "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537"
)

func testSatellite(t *testing.T) satellite.Satellite {
	t.Helper()
	tle, err := satelliteTLE.ParseTLE(issLine1, issLine2, "ISS (ZARYA)")
	if err != nil {
		t.Fatalf("ParseTLE(): %v", err)
	}
	return satellite.NewSatelliteFromTLE(tle, satellite.GravityWGS84)
}

func TestAtUsesUTCWholeSecondsAndDegreeCoordinates(t *testing.T) {
	sat := testSatellite(t)
	// This instant crosses a UTC date boundary and has a fractional second.
	instant := time.Date(2008, 9, 22, 1, 13, 14, 987654321, time.FixedZone("UTC+3", 3*60*60))
	got := At(sat, instant)
	wantTime := instant.UTC().Truncate(time.Second)
	if again := At(sat, instant.UTC()); got != again {
		t.Fatalf("equivalent UTC and offset timestamps differ: %+v vs %+v", got, again)
	}
	if !got.Time.Equal(wantTime) || got.Time.Location() != time.UTC || got.Time.Nanosecond() != 0 {
		t.Fatalf("Time = %v, want whole-second UTC %v", got.Time, wantTime)
	}

	pos, vel := satellite.Propagate(sat, wantTime.Year(), int(wantTime.Month()), wantTime.Day(), wantTime.Hour(), wantTime.Minute(), wantTime.Second())
	gmst := satellite.GSTimeFromDate(wantTime.Year(), int(wantTime.Month()), wantTime.Day(), wantTime.Hour(), wantTime.Minute(), wantTime.Second())
	alt, _, ll := satellite.ECIToLLA(pos, gmst)
	wantLat := ll.Latitude * 180 / math.Pi
	wantLon := normalizeLongitude(ll.Longitude * 180 / math.Pi)
	wantSpeed := math.Sqrt(vel.X*vel.X + vel.Y*vel.Y + vel.Z*vel.Z)
	if math.Abs(got.LatDeg-wantLat) > 1e-12 || math.Abs(got.LonDeg-wantLon) > 1e-12 || math.Abs(got.AltKm-alt) > 1e-12 {
		t.Fatalf("coordinates = (%g°, %g°, %g km), want (%g°, %g°, %g km)", got.LatDeg, got.LonDeg, got.AltKm, wantLat, wantLon, alt)
	}
	if math.Abs(got.SpeedKmS-wantSpeed) > 1e-12 {
		t.Fatalf("SpeedKmS = %.12f, want velocity vector norm %.12f", got.SpeedKmS, wantSpeed)
	}
	if math.Abs(got.PositionTEMEKm.X-pos.X)+math.Abs(got.PositionTEMEKm.Y-pos.Y)+math.Abs(got.PositionTEMEKm.Z-pos.Z) > 1e-12 {
		t.Fatalf("PositionTEMEKm = %+v, want propagated TEME vector %+v", got.PositionTEMEKm, pos)
	}
	if math.Abs(got.VelocityTEMEKmS.X-vel.X)+math.Abs(got.VelocityTEMEKmS.Y-vel.Y)+math.Abs(got.VelocityTEMEKmS.Z-vel.Z) > 1e-12 {
		t.Fatalf("VelocityTEMEKmS = %+v, want propagated velocity %+v", got.VelocityTEMEKmS, vel)
	}
	// This fixture also guards against accidentally exposing the dependency's radians as degrees.
	if got.LatDeg < -90 || got.LatDeg > 90 || got.LonDeg < -180 || got.LonDeg >= 180 {
		t.Fatalf("coordinates are outside degree ranges: lat=%g lon=%g", got.LatDeg, got.LonDeg)
	}
	for _, tc := range []struct {
		name string
		got  float64
		want float64
	}{
		{"latitude degrees", got.LatDeg, 23.212363074575},
		{"longitude degrees", got.LonDeg, 66.064142311857},
		{"altitude km", got.AltKm, 349.078748708197},
		{"speed km/s", got.SpeedKmS, 7.705468437467},
	} {
		if math.Abs(tc.got-tc.want) > 1e-8 {
			t.Errorf("%s = %.12f, want fixture %.12f", tc.name, tc.got, tc.want)
		}
	}
}

func TestAtIsIndependentOfLocalTimezone(t *testing.T) {
	sat := testSatellite(t)
	instant := time.Date(2008, 9, 21, 0, 15, 16, 0, time.UTC)
	previous := time.Local
	t.Cleanup(func() { time.Local = previous })
	time.Local = time.FixedZone("local-minus-seven", -7*60*60)
	got := At(sat, instant.In(time.Local))
	time.Local = time.FixedZone("local-plus-nine", 9*60*60)
	again := At(sat, instant.In(time.Local))
	if got != again {
		t.Fatalf("At() changed with time.Local: first=%+v second=%+v", got, again)
	}
}

func TestNormalizeLongitudeBoundary(t *testing.T) {
	for _, tc := range []struct{ input, want float64 }{{180, -180}, {-180, -180}, {540, -180}, {-540, -180}, {200, -160}, {-200, 160}, {720, 0}} {
		if got := normalizeLongitude(tc.input); got != tc.want {
			t.Errorf("normalizeLongitude(%g) = %g, want %g", tc.input, got, tc.want)
		}
	}
}
