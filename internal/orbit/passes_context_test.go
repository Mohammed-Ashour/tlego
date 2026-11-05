package orbit

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestPassSamplingStopsOnCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	calls := 0
	_, err := planPasses(ctx, func(time.Time) (State, error) { calls++; cancel(); return State{}, nil }, Observer{}, time.Now(), time.Hour, time.Second)
	if !errors.Is(err, context.Canceled) || calls != 1 {
		t.Fatalf("error=%v samples=%d", err, calls)
	}
}
