package orbit

import (
	"math"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
)

func TestObserverValidateBoundsAndFiniteValues(t *testing.T) {
	for _, o := range []Observer{{Lat: -90, Lon: 180, Alt: 0}, {Lat: 90, Lon: -180, Alt: -6378.136}} {
		if err := o.Validate(); err != nil {
			t.Errorf("valid observer %+v: %v", o, err)
		}
	}
	for _, o := range []Observer{{Lat: math.NaN()}, {Lat: 90.1}, {Lon: math.Inf(1)}, {Lon: -180.1}, {Alt: -6378.137}} {
		if err := o.Validate(); err == nil {
			t.Errorf("invalid observer %+v validated", o)
		}
	}
}

func TestValidateStateRejectsNonFinitePropagation(t *testing.T) {
	if err := ValidateState(State{PositionTEMEKm: structVector(math.NaN(), 0, 0)}); err == nil {
		t.Fatal("ValidateState accepted a non-finite position")
	}
}

func structVector(x, y, z float64) satellite.Vector3 { return satellite.Vector3{X: x, Y: y, Z: z} }

func TestPlanPassesRejectsUnsafeBudgetsBeforePropagation(t *testing.T) {
	for _, tc := range []struct {
		name           string
		duration, step time.Duration
	}{
		{"too long", 31 * 24 * time.Hour, time.Minute},
		{"subsecond step", time.Hour, time.Millisecond},
		{"too many samples", 30 * 24 * time.Hour, time.Second},
	} {
		t.Run(tc.name, func(t *testing.T) {
			if _, err := PlanPasses(satellite.Satellite{}, Observer{}, time.Time{}, tc.duration, tc.step); err == nil {
				t.Fatal("PlanPasses accepted unsafe budget")
			}
		})
	}
}
