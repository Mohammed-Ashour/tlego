package tui

import (
	"reflect"
	"testing"
	"time"
)

func TestComputePassesEquivalentTimezones(t *testing.T) {
	sat := testSatellite(t)
	start := time.Date(2008, 9, 20, 10, 25, 0, 0, time.UTC)
	position := PositionFromSatellite(sat, start)
	observer := Observer{Lat: position.LatDeg, Lon: position.LonDeg}
	want := ComputePasses(sat, observer, start, 2*time.Hour, time.Minute)
	if len(want) == 0 {
		t.Fatal("fixture must contain a pass")
	}
	for _, offset := range []int{-12, 2, 14} {
		local := start.In(time.FixedZone("offset", offset*60*60))
		got := ComputePasses(sat, observer, local, 2*time.Hour, time.Minute)
		if !reflect.DeepEqual(got, want) {
			t.Errorf("pass events differ at UTC offset %d: got %+v, want %+v", offset, got, want)
		}
	}
}

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
