package tui

import (
	"testing"
	"time"
)

func TestComputePassesReturnsUTCClippedPassEstimate(t *testing.T) {
	sat := testSatellite(t)
	start := time.Date(2008, 9, 20, 12, 25, 0, 0, time.FixedZone("UTC+2", 2*60*60))
	position := PositionFromSatellite(sat, start)
	passes := ComputePasses(sat, Observer{Lat: position.LatDeg, Lon: position.LonDeg}, start, 10*time.Second, 20*time.Second)
	if len(passes) != 1 {
		t.Fatalf("ComputePasses() returned %d passes, want 1", len(passes))
	}
	pass := passes[0]
	if !pass.Start.Equal(start.UTC()) || !pass.End.Equal(start.UTC().Add(10*time.Second)) {
		t.Fatalf("pass window = [%v, %v], want UTC window [%v, %v]", pass.Start, pass.End, start.UTC(), start.UTC().Add(10*time.Second))
	}
	if !pass.StartClipped || !pass.EndClipped {
		t.Fatalf("clipping flags = (%v, %v), want both true", pass.StartClipped, pass.EndClipped)
	}
	if pass.MaxElevationDeg <= 0 || !pass.MaxTime.Equal(start.UTC()) {
		t.Fatalf("unexpected sampled maximum: elevation=%v time=%v", pass.MaxElevationDeg, pass.MaxTime)
	}
}

func TestComputePassesRejectsNonPositiveDuration(t *testing.T) {
	if passes := ComputePasses(testSatellite(t), Observer{}, time.Now(), 0, time.Minute); len(passes) != 0 {
		t.Fatalf("ComputePasses() = %v, want no passes", passes)
	}
}
