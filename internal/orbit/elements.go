package orbit

import (
	"fmt"
	"math"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"github.com/Mohammed-Ashour/tlego/internal/sgp4"
)

// Propagator is an immutable SGP4 model initialized directly from a mean-element record.
type Propagator struct {
	model sgp4.Satellite
}

// New validates and initializes a direct mean-elements propagator using WGS-84 constants.
func New(record elements.Record) (*Propagator, error) {
	if err := record.Validate(); err != nil {
		return nil, err
	}
	model, err := sgp4.New(record.CatalogID, record.Epoch, record.MeanMotionRevDay, record.Eccentricity, record.InclinationDeg, record.RAANDeg, record.ArgumentOfPerigeeDeg, record.MeanAnomalyDeg, record.BStar, record.MeanMotionDot, record.MeanMotionDDot, sgp4.GravityWGS84)
	if err != nil {
		return nil, err
	}
	return &Propagator{model: model}, nil
}

// At propagates the record at whole-second UTC resolution, matching the legacy orbit API.
func (p *Propagator) At(t time.Time) (State, error) {
	if p == nil {
		return State{}, fmt.Errorf("nil propagator")
	}
	t = t.UTC().Truncate(time.Second)
	pos, vel, err := sgp4.At(p.model, t)
	if err != nil {
		return State{}, err
	}
	eci := satellite.Vector3{X: pos.X, Y: pos.Y, Z: pos.Z}
	gmst := satellite.GSTimeFromDate(t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
	alt, _, ll := satellite.ECIToLLA(eci, gmst)
	speed := math.Sqrt(vel.X*vel.X + vel.Y*vel.Y + vel.Z*vel.Z)
	state := State{Time: t, PositionTEMEKm: eci, VelocityTEMEKmS: satellite.Vector3{X: vel.X, Y: vel.Y, Z: vel.Z}, GMSTRad: gmst, LatDeg: ll.Latitude * 180 / math.Pi, LonDeg: normalizeLongitude(ll.Longitude * 180 / math.Pi), AltKm: alt, SpeedKmS: speed}
	if err := ValidateState(state); err != nil {
		return State{}, err
	}
	return state, nil
}

// OrbitInfoFromElements derives orbit metrics without requiring a fabricated TLE.
func OrbitInfoFromElements(r elements.Record) (OrbitInfo, error) {
	if err := r.Validate(); err != nil {
		return OrbitInfo{}, err
	}
	return orbitInfo(r.InclinationDeg, r.Eccentricity, r.MeanMotionRevDay)
}
