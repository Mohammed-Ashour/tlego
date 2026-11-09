package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/urfave/cli/v3"
)

const tonightFixture = "../examples/tui-demo/iss.tle"

func runTonight(t *testing.T, args ...string) (stdout, stderr string, err error) {
	t.Helper()
	var out, errOut bytes.Buffer
	command := newTonightCommand()
	command.Writer, command.ErrWriter = &out, &errOut
	command.ExitErrHandler = func(context.Context, *cli.Command, error) {}
	err = command.Run(context.Background(), append([]string{"tonight"}, args...))
	return out.String(), errOut.String(), err
}

func TestTonightTextNamesVisiblePass(t *testing.T) {
	stdout, stderr, err := runTonight(t, "--file", tonightFixture, "--time", "2026-10-24T12:00:00Z", "--lat", "51.48", "--lon", "0", "--utc")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"ISS (ZARYA) (25544)", "Dark sky: Sat 24 Oct", "visible for", "appears", "highest", "above"} {
		if !strings.Contains(stdout, want) {
			t.Errorf("stdout missing %q:\n%s", want, stdout)
		}
	}
	if !strings.Contains(stderr, "geometric estimate") {
		t.Errorf("stderr = %q", stderr)
	}
}

func TestTonightJSONIsOneDocumentWithUTCTimes(t *testing.T) {
	stdout, _, err := runTonight(t, "--file", tonightFixture, "--time", "2026-10-24T05:01:11Z", "--lat", "51.48", "--lon", "0", "--format", "json")
	if err != nil {
		t.Fatal(err)
	}
	var doc struct {
		Kind string `json:"kind"`
		Data struct {
			DarkStart string `json:"dark_start"`
			Passes    []struct {
				Peak struct {
					At           string  `json:"at"`
					ElevationDeg float64 `json:"elevation_deg"`
				} `json:"peak"`
			} `json:"passes"`
		} `json:"data"`
	}
	if err := json.Unmarshal([]byte(stdout), &doc); err != nil {
		t.Fatalf("%v\n%s", err, stdout)
	}
	if doc.Kind != "tonight" || len(doc.Data.Passes) != 1 || !strings.HasSuffix(doc.Data.Passes[0].Peak.At, "Z") {
		t.Fatalf("document = %+v", doc)
	}
	// Skyfield gives a peak of 85.47° at 05:24:46 for this pass.
	if got := doc.Data.Passes[0].Peak.ElevationDeg; got < 85 || got > 86 {
		t.Fatalf("peak elevation = %f", got)
	}
}

func TestTonightReportsMidnightSunAsSuccess(t *testing.T) {
	stdout, _, err := runTonight(t, "--file", tonightFixture, "--time", "2026-06-21T00:00:00Z", "--lat", "78", "--lon", "15")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout, "will not be dark enough") {
		t.Fatalf("stdout = %s", stdout)
	}
	stdout, _, err = runTonight(t, "--file", tonightFixture, "--time", "2026-06-21T00:00:00Z", "--lat", "78", "--lon", "15", "--format", "json")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout, `"dark_start": null`) || !strings.Contains(stdout, `"passes": []`) {
		t.Fatalf("stdout = %s", stdout)
	}
}

func TestTonightWarnsAboutDistantEpoch(t *testing.T) {
	_, stderr, err := runTonight(t, "--file", tonightFixture, "--time", "2026-12-24T12:00:00Z", "--lat", "51.48", "--lon", "0")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stderr, "days from the requested time") {
		t.Fatalf("stderr = %q", stderr)
	}
}

func TestTonightObserverSources(t *testing.T) {
	dir := t.TempDir()
	t.Setenv("XDG_CONFIG_HOME", dir)
	if _, _, err := runTonight(t, "--file", tonightFixture); err == nil || !strings.Contains(err.Error(), "no observer location") {
		t.Fatalf("unset observer error = %v", err)
	}
	if _, _, err := runTonight(t, "--file", tonightFixture, "--lat", "51"); err == nil || !strings.Contains(err.Error(), "both --lat and --lon") {
		t.Fatalf("partial observer error = %v", err)
	}
	if _, _, err := runTonight(t, "--file", tonightFixture, "--lat", "91", "--lon", "0"); err == nil {
		t.Fatal("accepted invalid latitude")
	}
	if err := os.MkdirAll(filepath.Join(dir, "khonsu"), 0o755); err != nil {
		t.Fatal(err)
	}
	settings := "observer:\n  lat: 51.48\n  lon: 0\n  alt: 0.1\n"
	if err := os.WriteFile(filepath.Join(dir, "khonsu", "tui.yaml"), []byte(settings), 0o600); err != nil {
		t.Fatal(err)
	}
	stdout, _, err := runTonight(t, "--file", tonightFixture, "--time", "2026-10-24T12:00:00Z")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout, "from 51.4800°, 0.0000°") {
		t.Fatalf("stdout = %s", stdout)
	}
}

func TestTonightRejectsInvalidCriteriaAndFormat(t *testing.T) {
	base := []string{"--file", tonightFixture, "--lat", "51", "--lon", "0"}
	for _, extra := range [][]string{{"--min-elevation", "95"}, {"--max-sun-elevation", "5"}, {"--format", "xml"}} {
		if _, _, err := runTonight(t, append(append([]string{}, base...), extra...)...); err == nil {
			t.Errorf("accepted %v", extra)
		}
	}
}

func TestTonightMovesPastAnEndingDarkPeriodWithNoPasses(t *testing.T) {
	stdout, _, err := runTonight(t, "--file", tonightFixture, "--time", "2026-10-24T06:04:30Z", "--lat", "51.48", "--lon", "0", "--utc")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout, "Dark sky: Sat 24 Oct 17:") {
		t.Fatalf("stdout = %s", stdout)
	}
}

func TestTonightParserFailuresUseJSONErrors(t *testing.T) {
	var stdout, stderr bytes.Buffer
	oldOut, oldErr := RootCmd.Writer, RootCmd.ErrWriter
	RootCmd.Writer, RootCmd.ErrWriter = &stdout, &stderr
	t.Cleanup(func() {
		if oldOut == nil {
			oldOut = os.Stdout
		}
		if oldErr == nil {
			oldErr = os.Stderr
		}
		RootCmd.Writer, RootCmd.ErrWriter = oldOut, oldErr
	})
	err := Run(context.Background(), []string{"khonsu", "tonight", "--format=json", "--unknown"})
	if err == nil || !IsReported(err) {
		t.Fatalf("error = %v, expected reported machine error", err)
	}
	if stdout.Len() != 0 || !strings.Contains(stderr.String(), `"kind":"error"`) {
		t.Fatalf("stdout = %q, stderr = %q", stdout.String(), stderr.String())
	}
}
