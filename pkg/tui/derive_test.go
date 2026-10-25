package tui

import (
	"math"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	satelliteTLE "github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

func testSatellite(t *testing.T) satellite.Satellite {
	t.Helper()
	line1 := "1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927"
	line2 := "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537"
	parsed, err := satelliteTLE.ParseTLE(
		line1,
		line2,
		"ISS (ZARYA)",
	)
	if err != nil {
		t.Fatalf("ParseTLE(): %v", err)
	}
	return satellite.NewSatelliteFromTLE(parsed, satellite.GravityWGS84)
}

func TestPositionFromSatelliteUsesUTCAndActualVelocityNorm(t *testing.T) {
	sat := testSatellite(t)
	instant := time.Date(2008, 9, 21, 12, 13, 14, 0, time.FixedZone("UTC+3", 3*60*60))
	got := PositionFromSatellite(sat, instant)
	if math.IsNaN(got.LatDeg) || math.IsNaN(got.LonDeg) || math.IsNaN(got.VelocityKm) {
		t.Fatal("non-finite position")
	}
	wantUTC := instant.UTC()
	if !got.Time.Equal(wantUTC) || got.Time.Location() != time.UTC {
		t.Fatalf("Time = %v, want UTC %v", got.Time, wantUTC)
	}
	position, velocity := satellite.Propagate(sat, wantUTC.Year(), int(wantUTC.Month()), wantUTC.Day(), wantUTC.Hour(), wantUTC.Minute(), wantUTC.Second())
	gmst := satellite.GSTimeFromDate(wantUTC.Year(), int(wantUTC.Month()), wantUTC.Day(), wantUTC.Hour(), wantUTC.Minute(), wantUTC.Second())
	altitude, _, ll := satellite.ECIToLLA(position, gmst)
	wantVelocity := math.Sqrt(velocity.X*velocity.X + velocity.Y*velocity.Y + velocity.Z*velocity.Z)
	if math.Abs(got.VelocityKm-wantVelocity) > 1e-12 {
		t.Errorf("VelocityKm = %.12f, want vector norm %.12f", got.VelocityKm, wantVelocity)
	}
	if math.Abs(got.AltKm-altitude) > 1e-9 {
		t.Errorf("AltKm = %.12f, want %.12f", got.AltKm, altitude)
	}
	if math.Abs(got.LatDeg-rad2deg(ll.Latitude)) > 1e-10 {
		t.Errorf("LatDeg = %v, want radians converted to degrees", got.LatDeg)
	}
	if got.LonDeg < -180 || got.LonDeg >= 180 {
		t.Errorf("longitude not normalized to [-180, 180): %v", got.LonDeg)
	}
}

func TestNormalizeLongitude(t *testing.T) {
	for _, tt := range []struct{ input, want float64 }{
		{180, -180}, {-180, -180}, {200, -160}, {-200, 160}, {720, 0},
	} {
		if got := normalizeLongitude(tt.input); got != tt.want {
			t.Errorf("normalizeLongitude(%v) = %v, want %v", tt.input, got, tt.want)
		}
	}
}

func TestOrbitInfoFromTLEKeepsInclinationInDegrees(t *testing.T) {
	got, err := OrbitInfoFromTLE(satelliteTLE.TLE{Line2: satelliteTLE.TLELine2{
		Inclination: "51.6416", Eccentricity: "0.0006703", MeanMotion: "15.72125391",
	}})
	if err != nil {
		t.Fatal(err)
	}
	if got.InclinationDeg != 51.6416 {
		t.Fatalf("InclinationDeg = %v, want 51.6416 degrees", got.InclinationDeg)
	}
}

func TestOrbitInfoFromTLERejectsNonPhysicalInputs(t *testing.T) {
	for _, tt := range []struct {
		name string
		line satelliteTLE.TLELine2
	}{
		{"nan inclination", satelliteTLE.TLELine2{Inclination: "NaN", Eccentricity: "0.1", MeanMotion: "15"}},
		{"out of range inclination", satelliteTLE.TLELine2{Inclination: "181", Eccentricity: "0.1", MeanMotion: "15"}},
		{"invalid eccentricity", satelliteTLE.TLELine2{Inclination: "45", Eccentricity: "1", MeanMotion: "15"}},
		{"zero mean motion", satelliteTLE.TLELine2{Inclination: "45", Eccentricity: "0.1", MeanMotion: "0"}},
		{"infinite mean motion", satelliteTLE.TLELine2{Inclination: "45", Eccentricity: "0.1", MeanMotion: "+Inf"}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := OrbitInfoFromTLE(satelliteTLE.TLE{Line2: tt.line}); err == nil {
				t.Fatal("OrbitInfoFromTLE() succeeded for invalid orbital elements")
			}
		})
	}
}
