package tui

import (
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"reflect"
	"strings"
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

func TestRenderSkyViewPlacesCompassAndTrack(t *testing.T) {
	track := []orbit.LookPoint{{AzimuthDeg: 270, ElevationDeg: 0}, {AzimuthDeg: 0, ElevationDeg: 90}, {AzimuthDeg: 90, ElevationDeg: 0}}
	rows := strings.Split(renderSkyView(track, 4), "\n")
	if len(rows) != 9 {
		t.Fatalf("got %d rows", len(rows))
	}
	if !strings.Contains(rows[0], "N") || !strings.Contains(rows[8], "S") {
		t.Fatalf("north and south misplaced:\n%s", strings.Join(rows, "\n"))
	}
	centre := rows[4]
	if centre[8] != '@' || !strings.HasPrefix(centre, "W") || !strings.HasSuffix(centre, "E") {
		t.Fatalf("centre row = %q", centre)
	}
}

func TestRenderWorldMapShadedMarksNightOnly(t *testing.T) {
	west := func(_, lon float64) bool { return lon < 0 }
	rows := strings.Split(renderWorldMapShaded(nil, 21, 9, west), "\n")
	if rows[1][2] != '.' || rows[1][18] != ' ' {
		t.Fatalf("shading wrong: %q", rows[1])
	}
	if strings.Contains(renderWorldMap(nil, 21, 9), ".") {
		t.Fatal("unshaded map contains night marks")
	}
}
