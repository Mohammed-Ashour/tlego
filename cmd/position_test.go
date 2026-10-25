package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
)

type fixtureTransport func(*http.Request) (*http.Response, error)

func (f fixtureTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestPredictUsesDegreeCoordinatesAndUTC(t *testing.T) {
	const line1 = "1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927"
	const line2 = "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537"
	originalTransport, originalDir := http.DefaultTransport, celestrak.DOWNLOAD_DIR
	t.Cleanup(func() { http.DefaultTransport, celestrak.DOWNLOAD_DIR = originalTransport, originalDir })
	celestrak.DOWNLOAD_DIR = t.TempDir()
	parsed, err := tle.ParseTLE(line1, line2, "ISS (ZARYA)")
	if err != nil {
		t.Fatal(err)
	}
	record, err := elements.FromTLE(parsed)
	if err != nil {
		t.Fatal(err)
	}
	gpBytes, err := json.Marshal(map[string]any{"OBJECT_NAME": record.Name, "NORAD_CAT_ID": 25544, "EPOCH": record.Epoch.Format(time.RFC3339Nano), "MEAN_MOTION": record.MeanMotionRevDay, "ECCENTRICITY": record.Eccentricity, "INCLINATION": record.InclinationDeg, "RA_OF_ASC_NODE": record.RAANDeg, "ARG_OF_PERICENTER": record.ArgumentOfPerigeeDeg, "MEAN_ANOMALY": record.MeanAnomalyDeg, "BSTAR": record.BStar, "MEAN_MOTION_DOT": record.MeanMotionDot, "MEAN_MOTION_DDOT": record.MeanMotionDDot})
	if err != nil {
		t.Fatal(err)
	}
	http.DefaultTransport = fixtureTransport(func(*http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(bytes.NewReader(gpBytes)), Header: make(http.Header)}, nil
	})
	instant := time.Date(2008, 9, 21, 0, 13, 14, 0, time.UTC)
	prop, err := orbit.New(record)
	if err != nil {
		t.Fatal(err)
	}
	want, err := prop.At(instant)
	if err != nil {
		t.Fatal(err)
	}
	var previous string
	for _, timestamp := range []string{"2008-09-21T00:13:14Z", "2008-09-21T02:13:14+02:00", "2008-09-20T19:13:14-05:00"} {
		var output bytes.Buffer
		command := newPredictCommand()
		command.Writer = &output
		if err := command.Run(context.Background(), []string{"predict", "--time", timestamp, "--cache-dir", celestrak.DOWNLOAD_DIR, "25544"}); err != nil {
			t.Fatal(err)
		}
		got := output.String()
		for _, expected := range []string{
			"Prediction Time: 2008-09-21T00:13:14Z",
			fmt.Sprintf("Latitude %.6f°, Longitude %.6f°, Altitude %.6f km", want.LatDeg, want.LonDeg, want.AltKm),
			locate.GetGoogleMapsURL(want.LatDeg, want.LonDeg),
		} {
			if !strings.Contains(got, expected) {
				t.Errorf("output missing %q:\n%s", expected, got)
			}
		}
		if previous != "" && got != previous {
			t.Error("equivalent timestamps produced different command output")
		}
		previous = got
	}
	// The existing report layout and map link use the same degree-valued state.
	report := generateReport(parsed, want.LatDeg, want.LonDeg, want.AltKm, want.Time)
	for _, expected := range []string{
		fmt.Sprintf("Latitude: %.6f°", want.LatDeg),
		fmt.Sprintf("Longitude: %.6f°", want.LonDeg),
		fmt.Sprintf("Altitude: %.6f km", want.AltKm),
		locate.GetGoogleMapsURL(want.LatDeg, want.LonDeg),
	} {
		if !strings.Contains(report, expected) {
			t.Errorf("report missing %q", expected)
		}
	}
}
