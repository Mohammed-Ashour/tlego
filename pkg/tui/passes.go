package tui

import (
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
)

type Pass struct {
	Start           time.Time
	End             time.Time
	MaxElevationDeg float64
	MaxTime         time.Time
	StartClipped    bool
	EndClipped      bool
}

// ComputePasses returns sampled pass estimates over [start, start+duration].
// StartClipped and EndClipped identify passes already in progress at a window
// boundary; rise, set, and maximum times are limited by the requested step.
func ComputePasses(sat satellite.Satellite, obs Observer, start time.Time, duration, step time.Duration) []Pass {
	if duration <= 0 {
		return nil
	}
	if step <= 0 {
		step = time.Minute
	}
	start = start.UTC()
	end := start.Add(duration)
	obsCoords := satellite.LatLong{
		Latitude:  deg2rad(obs.Lat),
		Longitude: deg2rad(obs.Lon),
	}
	var passes []Pass
	inPass := false
	var current Pass
	maxEl := -90.0
	for t := start; ; {
		pos, _ := satellite.Propagate(sat, t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
		jday := satellite.JDay(t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
		look := satellite.ECIToLookAngles(pos, obsCoords, obs.Alt, jday)
		elDeg := rad2deg(look.El)
		if elDeg > 0 {
			if !inPass {
				inPass = true
				current = Pass{Start: t, StartClipped: t.Equal(start)}
				maxEl = elDeg
				current.MaxTime = t
			}
			if elDeg > maxEl {
				maxEl = elDeg
				current.MaxTime = t
			}
		} else if inPass {
			inPass = false
			current.End = t
			current.MaxElevationDeg = maxEl
			passes = append(passes, current)
			maxEl = -90.0
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
	if inPass {
		current.End = end
		current.MaxElevationDeg = maxEl
		current.EndClipped = true
		passes = append(passes, current)
	}
	return passes
}
