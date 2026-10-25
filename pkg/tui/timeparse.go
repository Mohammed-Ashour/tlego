package tui

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

func parseTimeInput(value string, base time.Time) (time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return time.Time{}, fmt.Errorf("time value is empty")
	}
	if strings.EqualFold(value, "now") {
		return base, nil
	}
	if strings.HasPrefix(value, "+") || strings.HasPrefix(value, "-") {
		sign := 1.0
		if strings.HasPrefix(value, "-") {
			sign = -1.0
		}
		offset := strings.TrimSpace(value[1:])
		if strings.HasSuffix(offset, "d") {
			daysStr := strings.TrimSuffix(offset, "d")
			days, err := strconv.ParseFloat(daysStr, 64)
			if err != nil {
				return time.Time{}, fmt.Errorf("invalid day offset")
			}
			if days < 0 {
				return time.Time{}, fmt.Errorf("invalid day offset")
			}
			duration, err := durationFromFloat(sign * days * float64(24*time.Hour))
			if err != nil {
				return time.Time{}, fmt.Errorf("invalid day offset")
			}
			return base.Add(duration), nil
		}
		dur, err := time.ParseDuration(offset)
		if err != nil {
			return time.Time{}, fmt.Errorf("invalid duration: %v", err)
		}
		if dur < 0 {
			return time.Time{}, fmt.Errorf("invalid duration: expected a non-negative offset")
		}
		if sign < 0 {
			dur = -dur
		}
		return base.Add(dur), nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return time.Time{}, fmt.Errorf("time must be RFC3339 or relative (e.g., +2h)")
	}
	return parsed, nil
}

func durationFromFloat(value float64) (time.Duration, error) {
	if math.IsNaN(value) || math.IsInf(value, 0) || value > math.MaxInt64 || value < math.MinInt64 {
		return 0, fmt.Errorf("duration out of range")
	}
	return time.Duration(value), nil
}
