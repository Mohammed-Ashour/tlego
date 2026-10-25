package cmd

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestVizLocalExportAndFailures(t *testing.T) {
	path := filepath.Join(t.TempDir(), "orbit.html")
	run := func(args ...string) (string, error) {
		t.Helper()
		command := newVizCommand()
		var out bytes.Buffer
		command.Writer = &out
		err := command.Run(context.Background(), append([]string{"viz"}, args...))
		return out.String(), err
	}
	out, err := run("--file", "../examples/tui-demo/iss.tle", "--output", path, "--time", "2026-10-24T07:01:11+02:00")
	if err != nil || strings.TrimSpace(out) != path {
		t.Fatalf("local export: %s %v", out, err)
	}
	content, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(content, []byte(`"norad_id":"25544"`)) || !bytes.Contains(content, []byte(`2026-10-24T05:01:11Z`)) {
		t.Fatal("missing satellite or normalized UTC start")
	}
	for _, args := range [][]string{
		{}, {"--file", "missing.tle"}, {"--file", "../examples/tui-demo/iss.tle", "25544"},
		{"--file", "../examples/tui-demo/iss.tle", "--points", "0"},
		{"--file", "../examples/tui-demo/iss.tle", "--time", "invalid"},
		{"--file", "../examples/tui-demo/iss.tle", "--output", filepath.Join(t.TempDir(), "missing", "orbit.html")},
	} {
		out, err := run(args...)
		if err == nil || strings.TrimSpace(out) != "" {
			t.Fatalf("expected failure with no success output for %v: %q %v", args, out, err)
		}
	}
}
