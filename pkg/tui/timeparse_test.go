package tui

import (
	"testing"
	"time"
)

func TestParseTimeInputPreservesFractionalDayOffset(t *testing.T) {
	base := time.Date(2025, 1, 2, 3, 4, 5, 0, time.UTC)
	got, err := parseTimeInput("+0.5d", base)
	if err != nil {
		t.Fatal(err)
	}
	want := base.Add(12 * time.Hour)
	if !got.Equal(want) {
		t.Fatalf("parseTimeInput(+0.5d) = %v, want %v", got, want)
	}
}

func TestParseTimeInputSupportsNegativeFractionalDay(t *testing.T) {
	base := time.Date(2025, 1, 2, 3, 4, 5, 0, time.UTC)
	got, err := parseTimeInput("-1.25d", base)
	if err != nil {
		t.Fatal(err)
	}
	want := base.Add(-30 * time.Hour)
	if !got.Equal(want) {
		t.Fatalf("parseTimeInput(-1.25d) = %v, want %v", got, want)
	}
}

func TestParseTimeInputRejectsNonFiniteDayOffset(t *testing.T) {
	if _, err := parseTimeInput("+NaNd", time.Now()); err == nil {
		t.Fatal("parseTimeInput() succeeded for NaN offset")
	}
}
