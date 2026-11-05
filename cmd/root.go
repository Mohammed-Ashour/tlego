package cmd

import (
	"runtime/debug"

	"github.com/urfave/cli/v3"
)

// Version is set at release time through -ldflags.
var Version = "dev"

// resolveVersion prefers the release stamp, then the module version recorded
// by go install, so every install path reports a real version.
func resolveVersion(stamped string, info *debug.BuildInfo, ok bool) string {
	if stamped != "" && stamped != "dev" {
		return stamped
	}
	if ok && info != nil && info.Main.Version != "" && info.Main.Version != "(devel)" {
		return info.Main.Version
	}
	return "dev"
}

func buildVersion() string {
	info, ok := debug.ReadBuildInfo()
	return resolveVersion(Version, info, ok)
}

type Author struct {
	Name    string
	Email   string
	Website string
}

var RootCmd = &cli.Command{
	Name:        "tlego",
	Version:     buildVersion(),
	Usage:       "Track satellites and predict passes from your terminal",
	Description: "Browse satellites, predict positions and passes, and export orbit views using current CelesTrak GP data.",
	Authors: []any{
		Author{
			Name:    "Mohamed Ashour",
			Email:   "m.aly.ashour@gmail.com",
			Website: "blog.m-ashour.space",
		},
	},
}
