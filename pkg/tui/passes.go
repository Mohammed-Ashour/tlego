package tui

import (
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"time"
)

type Pass = orbit.Pass

func ComputePasses(sat satellite.Satellite, obs Observer, start time.Time, duration, step time.Duration) []Pass {
	if duration <= 0 {
		return nil
	}
	if step <= 0 {
		step = time.Minute
	}
	p, _ := orbit.PlanPasses(sat, obs, start, duration, step)
	return p
}
