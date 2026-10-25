package tui

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
)

const (
	earthRadiusKm = 6378.137
	earthMu       = 398600.4418
)

type Position struct {
	Time       time.Time
	LatDeg     float64
	LonDeg     float64
	AltKm      float64
	VelocityKm float64
}

type OrbitInfo struct {
	InclinationDeg float64
	Eccentricity   float64
	MeanMotion     float64
	PeriodMinutes  float64
	ApogeeKm       float64
	PerigeeKm      float64
	OrbitClass     string
}

func PositionFromSatellite(sat satellite.Satellite, t time.Time) Position {
	// The satellite package interprets the supplied calendar fields as UTC. Always
	// convert first so a non-UTC location does not shift the propagated instant.
	t = t.UTC()
	pos, vel := satellite.Propagate(sat, t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
	gmst := satellite.GSTimeFromDate(t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
	altKm, _, latLon := satellite.ECIToLLA(pos, gmst)
	latDeg := rad2deg(latLon.Latitude)
	lonDeg := normalizeLongitude(rad2deg(latLon.Longitude))
	return Position{
		Time:       t,
		LatDeg:     latDeg,
		LonDeg:     lonDeg,
		AltKm:      altKm,
		VelocityKm: math.Sqrt(vel.X*vel.X + vel.Y*vel.Y + vel.Z*vel.Z),
	}
}

func normalizeLongitude(lon float64) float64 {
	lon = math.Mod(lon+180, 360)
	if lon < 0 {
		lon += 360
	}
	return lon - 180
}

func OrbitInfoFromTLE(tle tle.TLE) (OrbitInfo, error) {
	inclination, err := strconv.ParseFloat(tle.Line2.Inclination, 64)
	if err != nil {
		return OrbitInfo{}, fmt.Errorf("invalid inclination: %w", err)
	}
	eccentricity, err := strconv.ParseFloat(tle.Line2.Eccentricity, 64)
	if err != nil {
		return OrbitInfo{}, fmt.Errorf("invalid eccentricity: %w", err)
	}
	meanMotion, err := strconv.ParseFloat(tle.Line2.MeanMotion, 64)
	if err != nil {
		return OrbitInfo{}, fmt.Errorf("invalid mean motion: %w", err)
	}
	if !finite(inclination) || inclination < 0 || inclination > 180 {
		return OrbitInfo{}, fmt.Errorf("inclination must be finite and between 0 and 180 degrees")
	}
	if !finite(eccentricity) || eccentricity < 0 || eccentricity >= 1 {
		return OrbitInfo{}, fmt.Errorf("eccentricity must be finite and between 0 (inclusive) and 1 (exclusive)")
	}
	if !finite(meanMotion) || meanMotion <= 0 {
		return OrbitInfo{}, fmt.Errorf("mean motion must be finite and greater than zero")
	}
	periodMinutes := 1440.0 / meanMotion
	meanMotionRad := meanMotion * 2 * math.Pi / 86400.0
	semiMajorAxis := math.Pow(earthMu/(meanMotionRad*meanMotionRad), 1.0/3.0)
	perigee := semiMajorAxis*(1.0-eccentricity) - earthRadiusKm
	apogee := semiMajorAxis*(1.0+eccentricity) - earthRadiusKm
	avgAlt := (perigee + apogee) / 2.0
	return OrbitInfo{
		InclinationDeg: inclination,
		Eccentricity:   eccentricity,
		MeanMotion:     meanMotion,
		PeriodMinutes:  periodMinutes,
		ApogeeKm:       apogee,
		PerigeeKm:      perigee,
		OrbitClass:     orbitClass(avgAlt),
	}, nil
}

func finite(value float64) bool {
	return !math.IsNaN(value) && !math.IsInf(value, 0)
}

func orbitClass(avgAltKm float64) string {
	switch {
	case avgAltKm < 2000:
		return "LEO"
	case avgAltKm < 35786:
		return "MEO"
	case avgAltKm < 42000:
		return "GEO"
	default:
		return "HEO"
	}
}

func MapURL(provider string, lat, lon float64) string {
	switch stringsLower(provider) {
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
	if age < time.Minute {
		return fmt.Sprintf("%ds", int(age.Seconds()))
	}
	if age < time.Hour {
		return fmt.Sprintf("%dm", int(age.Minutes()))
	}
	if age < 24*time.Hour {
		return fmt.Sprintf("%dh", int(age.Hours()))
	}
	return fmt.Sprintf("%dd", int(age.Hours()/24))
}

func deg2rad(deg float64) float64 {
	return deg * math.Pi / 180.0
}

func rad2deg(rad float64) float64 {
	return rad * 180.0 / math.Pi
}

func stringsLower(value string) string {
	if value == "" {
		return ""
	}
	return strings.ToLower(value)
}
