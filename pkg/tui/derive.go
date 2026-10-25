package tui

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
)

type Position = orbit.Position
type OrbitInfo = orbit.OrbitInfo

func PositionFromSatellite(sat satellite.Satellite, t time.Time) Position {
	return orbit.PositionFromSatellite(sat, t)
}

func rad2deg(rad float64) float64                   { return rad * 180 / math.Pi }
func OrbitInfoFromTLE(t tle.TLE) (OrbitInfo, error) { return orbit.OrbitInfoFromTLE(t) }
func MapURL(provider string, lat, lon float64) string {
	switch strings.ToLower(provider) {
	case "osm", "openstreetmap":
		return locate.GetOpenStreetMapURL(lat, lon)
	default:
		return locate.GetGoogleMapsURL(lat, lon)
	}
}
func FormatAge(age time.Duration) string {
	if age < 0 {
		age = -age
	}
	switch {
	case age < time.Minute:
		return fmt.Sprintf("%ds", int(age.Seconds()))
	case age < time.Hour:
		return fmt.Sprintf("%dm", int(age.Minutes()))
	case age < 24*time.Hour:
		return fmt.Sprintf("%dh", int(age.Hours()))
	default:
		return fmt.Sprintf("%dd", int(age.Hours()/24))
	}
}
