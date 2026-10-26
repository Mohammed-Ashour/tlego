package orbit

import (
	"fmt"
	"math"
	"strconv"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

// ValidateState rejects propagated states that contain non-finite values.
// The upstream SGP4 API has no error return, so callers should validate before
// using a state for geometry or presentation.
func ValidateState(s State) error {
	values := []float64{s.PositionTEMEKm.X, s.PositionTEMEKm.Y, s.PositionTEMEKm.Z,
		s.VelocityTEMEKmS.X, s.VelocityTEMEKmS.Y, s.VelocityTEMEKmS.Z,
		s.GMSTRad, s.LatDeg, s.LonDeg, s.AltKm, s.SpeedKmS}
	for _, value := range values {
		if !finite(value) {
			return fmt.Errorf("propagated state contains a non-finite value")
		}
	}
	return nil
}

const (
	earthRadiusKm      = 6378.137
	earthMu            = 398600.4418
	siderealDayMinutes = 1436.068
	geoAltitudeKm      = 35786.0
)

type Position struct {
	Time                              time.Time
	LatDeg, LonDeg, AltKm, VelocityKm float64
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
	s := At(sat, t)
	return Position{Time: s.Time, LatDeg: s.LatDeg, LonDeg: s.LonDeg, AltKm: s.AltKm, VelocityKm: s.SpeedKmS}
}

func OrbitInfoFromTLE(tle tle.TLE) (OrbitInfo, error) {
	inc, err := strconv.ParseFloat(tle.Line2.Inclination, 64)
	if err != nil {
		return OrbitInfo{}, fmt.Errorf("invalid inclination: %w", err)
	}
	ecc, err := strconv.ParseFloat(tle.Line2.Eccentricity, 64)
	if err != nil {
		return OrbitInfo{}, fmt.Errorf("invalid eccentricity: %w", err)
	}
	motion, err := strconv.ParseFloat(tle.Line2.MeanMotion, 64)
	if err != nil {
		return OrbitInfo{}, fmt.Errorf("invalid mean motion: %w", err)
	}
	if !finite(inc) || inc < 0 || inc > 180 {
		return OrbitInfo{}, fmt.Errorf("inclination must be finite and between 0 and 180 degrees")
	}
	if !finite(ecc) || ecc < 0 || ecc >= 1 {
		return OrbitInfo{}, fmt.Errorf("eccentricity must be finite and between 0 (inclusive) and 1 (exclusive)")
	}
	if !finite(motion) || motion <= 0 {
		return OrbitInfo{}, fmt.Errorf("mean motion must be finite and greater than zero")
	}
	return orbitInfo(inc, ecc, motion)
}

// orbitInfo applies two-body estimates to mean elements, not osculating states.
// Both ingestion paths use these same estimates and classification criteria.
func orbitInfo(inc, ecc, motion float64) (OrbitInfo, error) {
	period := 1440 / motion
	n := motion * 2 * math.Pi / 86400
	a := math.Cbrt(earthMu / (n * n))
	per := a*(1-ecc) - earthRadiusKm
	apo := a*(1+ecc) - earthRadiusKm
	if !finite(period) || !finite(a) || a <= 0 || !finite(per) || !finite(apo) {
		return OrbitInfo{}, fmt.Errorf("mean motion cannot produce finite orbit estimates")
	}
	info := OrbitInfo{inc, ecc, motion, period, apo, per, ""}
	info.OrbitClass = classify(info)
	return info, nil
}
func finite(v float64) bool { return !math.IsNaN(v) && !math.IsInf(v, 0) }

// classify returns project heuristics documented in docs/orbit-estimates.md.
// GEO requires a nearly circular, equatorial, sidereal-period orbit; altitude
// alone cannot distinguish geostationary from inclined or drifting orbits.
func classify(o OrbitInfo) string {
	switch {
	case math.Abs(o.PeriodMinutes-siderealDayMinutes) <= 0.01*siderealDayMinutes:
		if o.InclinationDeg <= 1 && o.Eccentricity <= 0.01 {
			return "GEO"
		}
		return "GSO"
	case o.ApogeeKm < 2000:
		return "LEO"
	case o.PerigeeKm >= 2000 && o.ApogeeKm < geoAltitudeKm:
		return "MEO"
	case o.PerigeeKm >= geoAltitudeKm:
		return "HEO"
	default:
		return "Other"
	}
}
