package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/urfave/cli/v3"
)

func TestMachineCommandsOfflineContract(t *testing.T) {
	file := "../examples/tui-demo/iss.tle"
	cases := []struct {
		name       string
		newCommand func() *cli.Command
		args       []string
	}{
		{"position", newPredictCommand, []string{"--file", file, "--time", "2026-10-24T07:01:11+02:00"}},
		{"report", newReportCommand, []string{"--file", file, "--time", "2026-10-24T05:01:11Z"}},
		{"passes", newPassesCommand, []string{"--file", file, "--time", "2026-10-24T05:01:11Z", "--lat", "51.48", "--lon", "0", "--duration", "2h"}},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			c := tc.newCommand()
			var stdout, stderr bytes.Buffer
			c.Writer = &stdout
			c.ErrWriter = &stderr
			args := append([]string{c.Name, "--format", "json"}, tc.args...)
			if err := c.Run(context.Background(), args); err != nil {
				t.Fatal(err, stderr.String())
			}
			var result output.Envelope
			if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
				t.Fatal(err, stdout.String())
			}
			if result.SchemaVersion != "1.0" || result.Kind != tc.name {
				t.Fatalf("unexpected document: %+v", result)
			}
			if result.Provenance.Source != "file" || result.Provenance.FetchedAt != nil || result.Provenance.CacheStatus != "none" {
				t.Fatalf("invented file provenance: %+v", result.Provenance)
			}
			if stderr.Len() != 0 {
				t.Fatalf("unexpected diagnostics: %s", stderr.String())
			}
		})
	}
}
func TestMachineFailureLeavesStdoutEmpty(t *testing.T) {
	for _, args := range [][]string{
		{"--file", "missing.tle", "--time", "2026-10-24T05:01:11Z"},
		{"--file", "../examples/tui-demo/iss.tle", "--time", "bad"},
		{"--file", "../examples/tui-demo/iss.tle", "--time", "2026-10-24T05:01:11Z", "--schema-version", "2.0"},
		{"--time", "2026-10-24T05:01:11Z", "../escape"},
	} {
		c := newPredictCommand()
		var stdout, stderr bytes.Buffer
		c.Writer = &stdout
		c.ErrWriter = &stderr
		err := c.Run(context.Background(), append([]string{"predict", "--format=json"}, args...))
		if err == nil || stdout.Len() != 0 {
			t.Fatalf("expected failure with clean stdout: %q %v", stdout.String(), err)
		}
		var result output.ErrorRecord
		if err := json.Unmarshal(stderr.Bytes(), &result); err != nil {
			t.Fatal(err, stderr.String())
		}
		if result.Kind != "error" || result.SchemaVersion != "1.0" || result.Error.Code == "" {
			t.Fatalf("bad error document: %+v", result)
		}
	}
}
func TestMachineStdinAndEquivalentTimestamps(t *testing.T) {
	var previous string
	for _, timestamp := range []string{"2008-09-21T00:13:14Z", "2008-09-20T19:13:14-05:00"} {
		input := "ISS (ZARYA)\n1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927\n2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537\n"
		c := newPredictCommand()
		var out, errout bytes.Buffer
		c.Reader = strings.NewReader(input)
		c.Writer = &out
		c.ErrWriter = &errout
		if err := c.Run(context.Background(), []string{"predict", "--file", "-", "--time", timestamp, "--format=json"}); err != nil {
			t.Fatal(err)
		}
		if previous != "" && previous != out.String() {
			t.Fatal("equivalent instants have different JSON")
		}
		previous = out.String()
	}
}
