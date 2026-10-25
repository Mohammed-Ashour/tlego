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
	earthRadiusKm = 6378.137
	earthMu       = 398600.4418
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
	period := 1440 / motion
	n := motion * 2 * math.Pi / 86400
	a := math.Cbrt(earthMu / (n * n))
	per := a*(1-ecc) - earthRadiusKm
	apo := a*(1+ecc) - earthRadiusKm
	return OrbitInfo{inc, ecc, motion, period, apo, per, classify((per + apo) / 2)}, nil
}
func finite(v float64) bool { return !math.IsNaN(v) && !math.IsInf(v, 0) }
func classify(a float64) string {
	switch {
	case a < 2000:
		return "LEO"
	case a < 35786:
		return "MEO"
	case a < 42000:
		return "GEO"
	default:
		return "HEO"
	}
}
