package visual

import (
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

func fixtureTLE(t *testing.T) tle.TLE {
	t.Helper()
	parsed, err := tle.ParseTLE(
		"1 25544U 98067A   24057.91666667  .00000000  00000+0  00000+0 0    04",
		"2 25544  51.6416 247.4627 0006946 130.5360 325.0288 15.49140836    00",
		"ISS",
	)
	if err != nil {
		t.Fatal(err)
	}
	return parsed
}

func TestCreateOrbitPointsAtProducesUTCPhysicalSamples(t *testing.T) {
	start := time.Date(2024, 3, 1, 12, 0, 0, 987654321, time.FixedZone("offset", 7200))
	points, err := CreateOrbitPointsAt(fixtureTLE(t), 10, start)
	if err != nil {
		t.Fatal(err)
	}
	if len(points) != 10 {
		t.Fatalf("got %d points, want 10", len(points))
	}
	if points[0].Time.Location() != time.UTC || points[0].Time.Nanosecond() != 0 {
		t.Fatalf("first sample is not whole-second UTC: %s", points[0].Time)
	}
	periodSeconds := 86400 / 15.49140836
	expectedEnd := points[0].Time.Add(time.Duration(periodSeconds * float64(time.Second))).Truncate(time.Second)
	if !points[len(points)-1].Time.Equal(expectedEnd) {
		t.Fatalf("last timestamp %s, want inclusive period endpoint %s", points[len(points)-1].Time, expectedEnd)
	}
	for i, point := range points {
		radius := math.Sqrt(point.X*point.X + point.Y*point.Y + point.Z*point.Z)
		if radius < 6600 || radius > 7500 {
			t.Errorf("point %d radius %.1f km appears scaled or invalid", i, radius)
		}
		if point.SpeedKmS < 6 || point.SpeedKmS > 9 {
			t.Errorf("point %d speed %.3f km/s is not a propagated velocity", i, point.SpeedKmS)
		}
		if point.AltitudeKm < 150 || point.AltitudeKm > 1000 {
			t.Errorf("point %d altitude %.1f km is unreasonable", i, point.AltitudeKm)
		}
		if point.LatitudeDeg < -90 || point.LatitudeDeg > 90 || point.LongitudeDeg < -180 || point.LongitudeDeg > 180 {
			t.Errorf("point %d has invalid geographic coordinates", i)
		}
		if i > 0 && point.Time.Sub(points[i-1].Time) < time.Second {
			t.Errorf("timestamps are not separated by at least one second")
		}
	}
}

func TestCreateOrbitPointsRejectsInvalidInput(t *testing.T) {
	tests := []struct {
		name string
		edit func(*tle.TLE)
		n    int
	}{
		{name: "too few points", n: 1},
		{name: "too many points", n: maxOrbitPoints + 1},
		{name: "bad mean motion", n: 4, edit: func(v *tle.TLE) { v.Line2.MeanMotion = "NaN" }},
		{name: "truncated raw TLE", n: 4, edit: func(v *tle.TLE) { v.Line1.LineString = "1 25544" }},
		{name: "mismatched satellite IDs", n: 4, edit: func(v *tle.TLE) { v.Line2.LineString = "2 00001" + v.Line2.LineString[7:] }},
		{name: "one second resolution", n: 4096, edit: func(v *tle.TLE) { v.Line2.MeanMotion = "90000" }},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			input := fixtureTLE(t)
			if tc.edit != nil {
				tc.edit(&input)
			}
			if _, err := CreateOrbitPointsAt(input, tc.n, time.Now()); err == nil {
				t.Fatal("expected input validation error")
			}
		})
	}
}

func TestWriteHTMLVisualEscapesPayloadAndPreservesExistingFileOnError(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "orbit.html")
	if err := os.WriteFile(path, []byte("previous export"), 0600); err != nil {
		t.Fatal(err)
	}
	bad := SatelliteData{Name: "bad", Points: []Point{{X: math.NaN(), Time: time.Now()}, {X: 7000, SpeedKmS: 7, Time: time.Now().Add(time.Second)}}}
	if _, err := WriteHTMLVisual([]SatelliteData{bad}, path); err == nil {
		t.Fatal("expected NaN validation error")
	}
	content, err := os.ReadFile(path)
	if err != nil || string(content) != "previous export" {
		t.Fatalf("failed export changed existing file: %q, %v", content, err)
	}

	points, err := CreateOrbitPointsAt(fixtureTLE(t), 3, time.Date(2024, 3, 1, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatal(err)
	}
	sat := SatelliteData{Name: "</script><img src=x onerror=alert(1)>", NORADID: "25544", Epoch: points[0].Time, Color: "not-a-color", Points: points}
	if got, err := WriteHTMLVisual([]SatelliteData{sat}, path); err != nil || got != path {
		t.Fatalf("WriteHTMLVisual() = %q, %v", got, err)
	}
	content, err = os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	page := string(content)
	if !strings.Contains(page, `id="orbit-data" type="application/json"`) {
		t.Fatal("missing JSON data script element")
	}
	if strings.Contains(page, "</script><img") || !strings.Contains(page, `\u003c/script\u003e`) {
		t.Fatal("hostile satellite name was not JSON escaped")
	}
	if !strings.Contains(page, `"frame":"TEME"`) || !strings.Contains(page, `"units":"km"`) {
		t.Fatal("missing document frame or units metadata")
	}
}

func TestWriteHTMLVisualRejectsEmptyAndDisjointData(t *testing.T) {
	if _, err := WriteHTMLVisual(nil, filepath.Join(t.TempDir(), "empty.html")); err == nil {
		t.Fatal("expected empty export rejection")
	}
	base := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	point := func(at time.Time) Point { return Point{X: 7000, Time: at, AltitudeKm: 600, SpeedKmS: 7.5} }
	sats := []SatelliteData{
		{Name: "a", Points: []Point{point(base), point(base.Add(time.Second))}},
		{Name: "b", Points: []Point{point(base.Add(2 * time.Second)), point(base.Add(3 * time.Second))}},
	}
	if _, err := WriteHTMLVisual(sats, filepath.Join(t.TempDir(), "disjoint.html")); err == nil {
		t.Fatal("expected disjoint timeline rejection")
	}
}

func TestWriterRejectsDegenerateAndNonFiniteTracks(t *testing.T) {
	points, err := CreateOrbitPoints(fixtureTLE(t), 3)
	if err != nil {
		t.Fatal(err)
	}
	for _, mutate := range []func([]Point) []Point{
		func(p []Point) []Point { return p[:1] },
		func(p []Point) []Point { p[1].X = math.Inf(1); return p },
		func(p []Point) []Point { p[1].AltitudeKm = -1; return p },
		func(p []Point) []Point { p[1].Time = p[0].Time; return p },
		func(p []Point) []Point { p[1].X = 0; p[1].Y = 0; p[1].Z = 0; return p },
	} {
		sample := mutate(append([]Point(nil), points...))
		if _, err := WriteHTMLVisual([]SatelliteData{{Name: "ISS", Points: sample}}, filepath.Join(t.TempDir(), "bad.html")); err == nil {
			t.Fatal("accepted invalid trajectory")
		}
	}
}

func TestWriteHTMLUsesNoRemoteAssetsAndIncludesLicense(t *testing.T) {
	points, err := CreateOrbitPoints(fixtureTLE(t), 3)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "offline.html")
	if _, err := WriteHTMLVisual([]SatelliteData{{Name: "ISS", Points: points}}, path); err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	page := string(b)
	for _, marker := range []string{`<script src=`, `<script type="module"`, `cdn.skypack.dev`, `@import url(`} {
		if strings.Contains(page, marker) {
			t.Fatalf("external asset dependency: %s", marker)
		}
	}
	if !strings.Contains(page, "Permission is hereby granted, free of charge") {
		t.Fatal("missing bundled renderer license")
	}
}
