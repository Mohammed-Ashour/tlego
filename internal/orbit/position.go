// Package orbit provides shared orbital calculations for TLEGO frontends.
// SGP4 numerical calculations remain owned by the pinned satellite dependency.
package orbit

import (
	"math"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
)

// State is a propagated TEME state and its geographic coordinates.
type State struct {
	Time            time.Time
	PositionTEMEKm  satellite.Vector3
	VelocityTEMEKmS satellite.Vector3
	GMSTRad         float64
	LatDeg          float64
	LonDeg          float64
	AltKm           float64
	SpeedKmS        float64
}

// At evaluates sat at the UTC instant truncated to the propagator's whole-second
// resolution. Latitude and longitude are degrees, longitude is in [-180, 180),
// altitude is km, and speed is the TEME velocity vector magnitude in km/s.
// The upstream propagator exposes no error return; this function does not
// establish that the supplied elements or propagated state are physically valid.
func At(sat satellite.Satellite, t time.Time) State {
	t = t.UTC().Truncate(time.Second)
	pos, vel := satellite.Propagate(sat, t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
	gmst := satellite.GSTimeFromDate(t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
	alt, _, ll := satellite.ECIToLLA(pos, gmst)
	return State{
		Time: t, PositionTEMEKm: pos, VelocityTEMEKmS: vel, GMSTRad: gmst,
		LatDeg: ll.Latitude * 180 / math.Pi,
		LonDeg: normalizeLongitude(ll.Longitude * 180 / math.Pi),
		AltKm:  alt, SpeedKmS: math.Sqrt(vel.X*vel.X + vel.Y*vel.Y + vel.Z*vel.Z),
	}
}

func normalizeLongitude(deg float64) float64 {
	deg = math.Mod(deg+180, 360)
	if deg < 0 {
		deg += 360
	}
	return deg - 180
}
