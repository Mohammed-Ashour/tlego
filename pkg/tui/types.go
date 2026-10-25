package tui

import "time"

type TLESummary struct {
	Name       string
	NoradID    string
	Age        time.Duration
	OrbitClass string
}

type PredictResult struct {
	Time   time.Time
	LatDeg float64
	LonDeg float64
	AltKm  float64
	MapURL string
}

type TrackSnapshot struct {
	Position Position
}
