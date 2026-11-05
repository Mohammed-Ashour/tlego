package orbit

import (
	"context"
	"fmt"
	"time"
)

// TrackSample is one propagated state, with a direction when an observer is given.
type TrackSample struct {
	State  State
	Sunlit bool
	Look   *LookPoint
}

// Track samples a window at a fixed step from its start, stopping at the last step
// that fits. If propagation
// fails partway, for example on a decaying object, it returns the samples so far
// with the error.
func Track(ctx context.Context, prop *Propagator, start time.Time, duration, step time.Duration, maxSamples int, obs *Observer) ([]TrackSample, error) {
	if duration <= 0 || step < time.Second {
		return nil, fmt.Errorf("duration must be positive and step at least one second")
	}
	if int64(duration/step)+1 > int64(maxSamples) {
		return nil, fmt.Errorf("track would exceed %d samples", maxSamples)
	}
	if obs != nil {
		if err := obs.Validate(); err != nil {
			return nil, err
		}
	}
	start = start.UTC().Truncate(time.Second)
	samples := make([]TrackSample, 0, duration/step+1)
	for offset := time.Duration(0); offset <= duration; offset += step {
		if err := ctx.Err(); err != nil {
			return nil, err
		}
		state, err := prop.At(start.Add(offset))
		if err != nil {
			return samples, fmt.Errorf("invalid propagated state at %s: %w", start.Add(offset).Format(time.RFC3339), err)
		}
		sample := TrackSample{State: state, Sunlit: !InEarthShadow(state.PositionTEMEKm, SunPositionKm(state.Time))}
		if obs != nil {
			elevation, azimuth := lookAngles(state, *obs)
			sample.Look = &LookPoint{Time: state.Time, AzimuthDeg: azimuth, ElevationDeg: elevation}
		}
		samples = append(samples, sample)
	}
	return samples, nil
}

// Tonight holds the visible passes in the dark period chosen by PlanTonight.
type Tonight struct {
	Window *DarkWindow
	Passes []VisiblePass
}

const (
	tonightSearchLimit = 24 * time.Hour
	// A dark period ending this soon says little about the coming night.
	shortDarkRemainder = time.Hour
)

// TonightSearchLimit is how far ahead PlanTonight looks for a dark period.
func TonightSearchLimit() time.Duration { return tonightSearchLimit }

// PlanTonight finds the next dark period and its visible passes. When less than
// an hour of a current dark period remains and it has no passes, it uses the next one.
func PlanTonight(ctx context.Context, prop *Propagator, obs Observer, from time.Time, criteria Visibility) (Tonight, error) {
	if err := criteria.Validate(); err != nil {
		return Tonight{}, err
	}
	from = from.UTC().Truncate(time.Second)
	window, found, err := NextDarkWindow(obs, from, tonightSearchLimit, criteria.MaxSunElevationDeg)
	if err != nil || !found {
		return Tonight{}, err
	}
	passes, err := PlanVisiblePasses(ctx, prop, obs, window.Start, window.End.Sub(window.Start), criteria)
	if err != nil {
		return Tonight{}, err
	}
	if len(passes) == 0 && !window.Clipped && window.Start.Equal(from) && window.End.Sub(from) < shortDarkRemainder {
		next, nextFound, err := NextDarkWindow(obs, window.End, tonightSearchLimit, criteria.MaxSunElevationDeg)
		if err != nil {
			return Tonight{}, err
		}
		if nextFound {
			passes, err = PlanVisiblePasses(ctx, prop, obs, next.Start, next.End.Sub(next.Start), criteria)
			if err != nil {
				return Tonight{}, err
			}
			window = next
		}
	}
	return Tonight{Window: &window, Passes: passes}, nil
}
