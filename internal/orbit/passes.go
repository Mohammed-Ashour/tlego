package orbit

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
)

type Observer struct {
	Lat float64 `yaml:"lat"`
	Lon float64 `yaml:"lon"`
	Alt float64 `yaml:"alt"`
}
type Pass struct {
	Start           time.Time
	End             time.Time
	MaxElevationDeg float64
	MaxTime         time.Time
	StartClipped    bool
	EndClipped      bool
	StartAzimuthDeg float64
	MaxAzimuthDeg   float64
	EndAzimuthDeg   float64
}

const (
	wgs84Flattening          = 1 / 298.257223563
	wgs84EccentricitySquared = wgs84Flattening * (2 - wgs84Flattening)
	maxPlanDuration          = 30 * 24 * time.Hour
	maxPlanSamples           = 250000
)

func (o Observer) Validate() error {
	if !finite(o.Lat) || o.Lat < -90 || o.Lat > 90 {
		return fmt.Errorf("observer latitude must be finite and between -90 and 90 degrees")
	}
	if !finite(o.Lon) || o.Lon < -180 || o.Lon > 180 {
		return fmt.Errorf("observer longitude must be finite and between -180 and 180 degrees")
	}
	if !finite(o.Alt) || o.Alt <= -earthRadiusKm {
		return fmt.Errorf("observer altitude must be finite and greater than -%.3f km", earthRadiusKm)
	}
	return nil
}

// PlanPasses estimates passes by sampling elevation at step intervals.
func PlanPasses(sat satellite.Satellite, obs Observer, start time.Time, duration, step time.Duration) ([]Pass, error) {
	return PlanPassesContext(context.Background(), sat, obs, start, duration, step)
}

// PlanPassesContext estimates passes and stops sampling when ctx is canceled.
func PlanPassesContext(ctx context.Context, sat satellite.Satellite, obs Observer, start time.Time, duration, step time.Duration) ([]Pass, error) {
	return planPasses(ctx, func(t time.Time) (State, error) { state := At(sat, t); return state, ValidateState(state) }, obs, start, duration, step)
}

// PlanPassesElements estimates passes from directly initialized mean elements.
func PlanPassesElements(prop *Propagator, obs Observer, start time.Time, duration, step time.Duration) ([]Pass, error) {
	return PlanPassesElementsContext(context.Background(), prop, obs, start, duration, step)
}

// PlanPassesElementsContext stops sampling when ctx is canceled.
func PlanPassesElementsContext(ctx context.Context, prop *Propagator, obs Observer, start time.Time, duration, step time.Duration) ([]Pass, error) {
	return planPasses(ctx, prop.At, obs, start, duration, step)
}

func planPasses(ctx context.Context, at func(time.Time) (State, error), obs Observer, start time.Time, duration, step time.Duration) ([]Pass, error) {
	if err := obs.Validate(); err != nil {
		return nil, err
	}
	if duration <= 0 || duration > maxPlanDuration {
		return nil, fmt.Errorf("duration must be greater than zero and no more than 30 days")
	}
	if step < time.Second {
		return nil, fmt.Errorf("step must be at least one second")
	}
	// Include both endpoints and account for the final partial interval.
	samples := int64(duration / step)
	if duration%step != 0 {
		samples++
	}
	if samples+1 > maxPlanSamples {
		return nil, fmt.Errorf("pass plan would exceed %d samples", maxPlanSamples)
	}
	start = start.UTC()
	end := start.Add(duration)
	sample := func(t time.Time) (float64, float64, error) {
		if err := ctx.Err(); err != nil {
			return 0, 0, err
		}
		state, err := at(t)
		if err != nil {
			return 0, 0, fmt.Errorf("invalid propagated state at %s: %w", t.Format(time.RFC3339), err)
		}
		if state.Time.IsZero() {
			state.Time = t
		}
		el, az := lookAngles(state, obs)
		return el, az, nil
	}
	var passes []Pass
	in := false
	var cur Pass
	var previous time.Time
	maxEl := -90.0
	closePass := func() error {
		peak, peakEl, peakAz, err := refinePeak(sample, cur.MaxTime, maxEl, step, cur.Start, cur.End)
		if err != nil {
			return err
		}
		cur.MaxTime, cur.MaxElevationDeg, cur.MaxAzimuthDeg = peak, peakEl, peakAz
		passes = append(passes, cur)
		return nil
	}
	for t := start; ; {
		el, az, err := sample(t)
		if err != nil {
			return nil, err
		}
		if el > 0 {
			if !in {
				in = true
				cur = Pass{Start: t, StartAzimuthDeg: az, StartClipped: t.Equal(start)}
				if !cur.StartClipped {
					// The rise lies after the previous sample, which was at or below the horizon.
					if cur.Start, cur.StartAzimuthDeg, err = refineCrossing(sample, previous, t, true); err != nil {
						return nil, err
					}
				}
				maxEl = el
				cur.MaxTime = t
			}
			if el > maxEl {
				maxEl = el
				cur.MaxTime = t
			}
		} else if in {
			in = false
			if cur.End, cur.EndAzimuthDeg, err = refineCrossing(sample, previous, t, false); err != nil {
				return nil, err
			}
			if err := closePass(); err != nil {
				return nil, err
			}
			maxEl = -90
		}
		if !t.Before(end) {
			break
		}
		previous = t
		next := t.Add(step)
		if next.After(end) {
			next = end
		}
		t = next
	}
	if in {
		_, az, err := sample(end)
		if err != nil {
			return nil, err
		}
		cur.End, cur.EndAzimuthDeg, cur.EndClipped = end, az, true
		if err := closePass(); err != nil {
			return nil, err
		}
	}
	return passes, nil
}

// lookAngles returns elevation and true-north azimuth in degrees for a TEME state,
// placing the observer on the WGS-84 ellipsoid at its geodetic latitude.
func lookAngles(state State, obs Observer) (elevationDeg, azimuthDeg float64) {
	t := state.Time
	gmst := satellite.GSTimeFromDate(t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
	lat, theta := obs.Lat*math.Pi/180, gmst+obs.Lon*math.Pi/180
	sinLat, cosLat, sinTheta, cosTheta := math.Sin(lat), math.Cos(lat), math.Sin(theta), math.Cos(theta)
	c := 1 / math.Sqrt(1-wgs84EccentricitySquared*sinLat*sinLat)
	radial := (earthRadiusKm*c + obs.Alt) * cosLat
	axial := (earthRadiusKm*c*(1-wgs84EccentricitySquared) + obs.Alt) * sinLat
	rx := state.PositionTEMEKm.X - radial*cosTheta
	ry := state.PositionTEMEKm.Y - radial*sinTheta
	rz := state.PositionTEMEKm.Z - axial
	south := sinLat*cosTheta*rx + sinLat*sinTheta*ry - cosLat*rz
	east := -sinTheta*rx + cosTheta*ry
	up := cosLat*cosTheta*rx + cosLat*sinTheta*ry + sinLat*rz
	azimuth := math.Atan2(east, -south) * 180 / math.Pi
	return math.Atan2(up, math.Hypot(south, east)) * 180 / math.Pi, math.Mod(azimuth+360, 360)
}

type passSample func(time.Time) (elevationDeg, azimuthDeg float64, err error)

// refineCrossing bisects to whole-second resolution. The returned time is the
// earlier sample above the horizon for a rise and at or below it for a set.
func refineCrossing(sample passSample, low, high time.Time, rising bool) (time.Time, float64, error) {
	for high.Sub(low) > time.Second {
		middle := low.Add(high.Sub(low) / 2).Truncate(time.Second)
		if !middle.After(low) {
			break
		}
		el, _, err := sample(middle)
		if err != nil {
			return time.Time{}, 0, err
		}
		if (el > 0) == rising {
			high = middle
		} else {
			low = middle
		}
	}
	_, az, err := sample(high)
	return high, az, err
}

// refinePeak narrows the sampled maximum to whole-second resolution inside the pass.
func refinePeak(sample passSample, at time.Time, elevation float64, step time.Duration, passStart, passEnd time.Time) (time.Time, float64, float64, error) {
	low, high := at.Add(-step), at.Add(step)
	if low.Before(passStart) {
		low = passStart
	}
	if high.After(passEnd) {
		high = passEnd
	}
	for high.Sub(low) > 2*time.Second {
		third := high.Sub(low) / 3
		a, b := low.Add(third).Truncate(time.Second), high.Add(-third).Truncate(time.Second)
		elA, _, err := sample(a)
		if err != nil {
			return time.Time{}, 0, 0, err
		}
		elB, _, err := sample(b)
		if err != nil {
			return time.Time{}, 0, 0, err
		}
		if elA < elB {
			low = a
		} else {
			high = b
		}
	}
	best, bestEl := at, elevation
	for t := low; !t.After(high); t = t.Add(time.Second) {
		el, _, err := sample(t)
		if err != nil {
			return time.Time{}, 0, 0, err
		}
		if el > bestEl {
			best, bestEl = t, el
		}
	}
	_, az, err := sample(best)
	return best, bestEl, az, err
}
