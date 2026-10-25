package orbit

import (
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
}

const (
	maxPlanDuration = 30 * 24 * time.Hour
	maxPlanSamples  = 250000
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
	coords := satellite.LatLong{Latitude: obs.Lat * math.Pi / 180, Longitude: obs.Lon * math.Pi / 180}
	var passes []Pass
	in := false
	var cur Pass
	maxEl := -90.0
	for t := start; ; {
		state := At(sat, t)
		if err := ValidateState(state); err != nil {
			return nil, fmt.Errorf("invalid propagated state at %s: %w", t.Format(time.RFC3339), err)
		}
		jd := satellite.JDay(t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
		look := satellite.ECIToLookAngles(state.PositionTEMEKm, coords, obs.Alt, jd)
		el := look.El * 180 / math.Pi
		if el > 0 {
			if !in {
				in = true
				cur = Pass{Start: t, StartClipped: t.Equal(start)}
				maxEl = el
				cur.MaxTime = t
			}
			if el > maxEl {
				maxEl = el
				cur.MaxTime = t
			}
		} else if in {
			in = false
			cur.End = t
			cur.MaxElevationDeg = maxEl
			passes = append(passes, cur)
			maxEl = -90
		}
		if !t.Before(end) {
			break
		}
		next := t.Add(step)
		if next.After(end) {
			next = end
		}
		t = next
	}
	if in {
		cur.End = end
		cur.MaxElevationDeg = maxEl
		cur.EndClipped = true
		passes = append(passes, cur)
	}
	return passes, nil
}
