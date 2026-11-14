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
	Name:        "khonsu",
	Version:     buildVersion(),
	Usage:       "Follow what crosses the sky, in your browser or terminal",
	Description: "Start with khonsu web: follow a satellite on a 3D globe, read why its orbit is the way it is, and estimate when you might see it. The terminal UI (khonsu tui) and the commands below use the same calculations, with orbital elements from CelesTrak. Pass results are estimates.",
	Authors: []any{
		Author{
			Name:    "Mohamed Ashour",
			Email:   "m.aly.ashour@gmail.com",
			Website: "blog.m-ashour.space",
		},
	},
}
