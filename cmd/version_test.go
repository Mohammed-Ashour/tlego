package cmd

import (
	"runtime/debug"
	"testing"
)

func TestResolveVersion(t *testing.T) {
	module := func(v string) *debug.BuildInfo {
		info := &debug.BuildInfo{}
		info.Main.Version = v
		return info
	}
	cases := []struct {
		name    string
		stamped string
		info    *debug.BuildInfo
		ok      bool
		want    string
	}{
		{"release stamp wins", "v0.3.0", module("v0.2.2"), true, "v0.3.0"},
		{"go install uses the module version", "dev", module("v0.3.0"), true, "v0.3.0"},
		{"checkout build stays dev", "dev", module("(devel)"), true, "dev"},
		{"missing build info stays dev", "dev", nil, false, "dev"},
		{"empty stamp stays dev", "", module(""), true, "dev"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := resolveVersion(tc.stamped, tc.info, tc.ok); got != tc.want {
				t.Fatalf("resolveVersion() = %q, want %q", got, tc.want)
			}
		})
	}
}
