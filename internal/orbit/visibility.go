package orbit

import (
	"context"
	"fmt"
	"time"
)

// Visibility holds the declared naked-eye criteria. A satellite counts as visible
// when it is above MinElevationDeg, outside Earth's shadow, and the Sun at the
// observer is at or below MaxSunElevationDeg.
type Visibility struct {
	MinElevationDeg    float64
	MaxSunElevationDeg float64
}

// DefaultVisibility requires 10° above the horizon and civil twilight or darker.
func DefaultVisibility() Visibility {
	return Visibility{MinElevationDeg: 10, MaxSunElevationDeg: -6}
}

// Validate rejects criteria that cannot describe a sky position or Sun elevation.
func (v Visibility) Validate() error {
	if !finite(v.MinElevationDeg) || v.MinElevationDeg < 0 || v.MinElevationDeg >= 90 {
		return fmt.Errorf("minimum elevation must be at least 0 and below 90 degrees")
	}
	if !finite(v.MaxSunElevationDeg) || v.MaxSunElevationDeg < -90 || v.MaxSunElevationDeg > 0 {
		return fmt.Errorf("maximum Sun elevation must be between -90 and 0 degrees")
	}
	return nil
}

// LookPoint is a satellite direction seen by an observer.
type LookPoint struct {
	Time         time.Time
	AzimuthDeg   float64
	ElevationDeg float64
}

// VisiblePass is the longest continuous visible part of one pass.
type VisiblePass struct {
	Start, Peak, End LookPoint
	EndsInShadow     bool
}

// DarkWindow is a period in which the Sun stays at or below a limit. Clipped
// means the search limit ended the window before the Sun rose above the limit.
type DarkWindow struct {
	Start, End time.Time
	Clipped    bool
}

const (
	darkScanStep      = time.Minute
	visibilityStep    = 5 * time.Second
	visibilityPassGap = 30 * time.Second
)

// NextDarkWindow finds the first window at or after from, searching up to limit ahead.
func NextDarkWindow(obs Observer, from time.Time, limit time.Duration, maxSunElevationDeg float64) (DarkWindow, bool, error) {
	if err := obs.Validate(); err != nil {
		return DarkWindow{}, false, err
	}
	if limit <= 0 || limit > maxPlanDuration {
		return DarkWindow{}, false, fmt.Errorf("dark window search must be greater than zero and no more than 30 days")
	}
	from = from.UTC().Truncate(time.Second)
	end := from.Add(limit)
	var window DarkWindow
	inside := false
	for t := from; ; {
		dark := SunElevationDeg(obs.Lat, obs.Lon, t) <= maxSunElevationDeg
		if dark && !inside {
			inside, window.Start = true, t
		}
		if !dark && inside {
			window.End = t
			return window, true, nil
		}
		if !t.Before(end) {
			break
		}
		t = t.Add(darkScanStep)
		if t.After(end) {
			t = end
		}
	}
	if inside {
		window.End, window.Clipped = end, true
		return window, true, nil
	}
	return DarkWindow{}, false, nil
}

// PlanVisiblePasses returns the visible part of every pass in the window. Times
// resolve to five seconds, and a pass shorter than the 30-second pass search step
// can be missed.
func PlanVisiblePasses(ctx context.Context, prop *Propagator, obs Observer, start time.Time, duration time.Duration, criteria Visibility) ([]VisiblePass, error) {
	if err := criteria.Validate(); err != nil {
		return nil, err
	}
	if duration > 0 && int64(duration/visibilityStep) > maxPlanSamples {
		return nil, fmt.Errorf("visibility plan would exceed %d samples", maxPlanSamples)
	}
	passes, err := PlanPassesElementsContext(ctx, prop, obs, start, duration, visibilityPassGap)
	if err != nil {
		return nil, err
	}
	visible := []VisiblePass{}
	for _, pass := range passes {
		segment, ok, err := visibleSegment(ctx, prop, obs, pass, criteria)
		if err != nil {
			return nil, err
		}
		if ok {
			visible = append(visible, segment)
		}
	}
	return visible, nil
}

func visibleSegment(ctx context.Context, prop *Propagator, obs Observer, pass Pass, criteria Visibility) (VisiblePass, bool, error) {
	var best, current VisiblePass
	var bestLength time.Duration
	inside := false
	finish := func(endsInShadow bool) {
		current.EndsInShadow = endsInShadow
		if length := current.End.Time.Sub(current.Start.Time); length >= bestLength {
			best, bestLength = current, length
		}
		inside = false
	}
	found := false
	for t := pass.Start; ; {
		if err := ctx.Err(); err != nil {
			return VisiblePass{}, false, err
		}
		point, shadowed, err := lookPoint(prop, obs, t)
		if err != nil {
			return VisiblePass{}, false, fmt.Errorf("invalid propagated state at %s: %w", t.Format(time.RFC3339), err)
		}
		isVisible := !shadowed && point.ElevationDeg >= criteria.MinElevationDeg && SunElevationDeg(obs.Lat, obs.Lon, t) <= criteria.MaxSunElevationDeg
		switch {
		case isVisible && !inside:
			inside, found = true, true
			current = VisiblePass{Start: point, Peak: point, End: point}
		case isVisible:
			current.End = point
			if point.ElevationDeg > current.Peak.ElevationDeg {
				current.Peak = point
			}
		case inside:
			finish(shadowed)
		}
		if !t.Before(pass.End) {
			break
		}
		t = t.Add(visibilityStep)
		if t.After(pass.End) {
			t = pass.End
		}
	}
	if inside {
		finish(false)
	}
	return best, found, nil
}

func lookPoint(prop *Propagator, obs Observer, t time.Time) (LookPoint, bool, error) {
	state, err := prop.At(t)
	if err != nil {
		return LookPoint{}, false, err
	}
	elevation, azimuth := lookAngles(state, obs)
	return LookPoint{state.Time, azimuth, elevation}, InEarthShadow(state.PositionTEMEKm, SunPositionKm(state.Time)), nil
}

// PassTrack samples a pass's sky path for plotting, including both ends.
func PassTrack(prop *Propagator, obs Observer, pass Pass, samples int) ([]LookPoint, error) {
	if samples < 2 {
		samples = 2
	}
	span := pass.End.Sub(pass.Start)
	points := make([]LookPoint, 0, samples)
	for i := 0; i < samples; i++ {
		point, _, err := lookPoint(prop, obs, pass.Start.Add(span*time.Duration(i)/time.Duration(samples-1)))
		if err != nil {
			return nil, err
		}
		points = append(points, point)
	}
	return points, nil
}
