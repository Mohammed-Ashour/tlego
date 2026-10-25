package tui

import (
	"math"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/orbit"
)

func buildTrail(sat *orbit.Propagator, now time.Time, duration, step time.Duration) []Position {
	if step <= 0 {
		step = 5 * time.Minute
	}
	start := now.Add(-duration)
	var points []Position
	for t := start; !t.After(now); t = t.Add(step) {
		state, err := sat.At(t)
		if err == nil {
			points = append(points, positionFromState(state))
		}
	}
	return points
}

func renderWorldMap(points []Position, width, height int) string {
	if width < 20 {
		width = 20
	}
	if height < 8 {
		height = 8
	}
	grid := make([][]rune, height)
	for i := range grid {
		grid[i] = make([]rune, width)
		for j := range grid[i] {
			grid[i][j] = ' '
		}
	}
	eq := height / 2
	pm := width / 2
	for x := 0; x < width; x++ {
		grid[eq][x] = '-'
	}
	for y := 0; y < height; y++ {
		grid[y][pm] = '|'
	}
	grid[eq][pm] = '+'

	for i, pos := range points {
		x, y := mapToGrid(pos.LatDeg, pos.LonDeg, width, height)
		if x < 0 || y < 0 || y >= height || x >= width {
			continue
		}
		ch := '*'
		if i == len(points)-1 {
			ch = '@'
		}
		grid[y][x] = ch
	}

	var b strings.Builder
	for y := 0; y < height; y++ {
		b.WriteString(string(grid[y]))
		if y < height-1 {
			b.WriteString("\n")
		}
	}
	return b.String()
}

func mapToGrid(lat, lon float64, width, height int) (int, int) {
	lat = clamp(lat, -90, 90)
	lon = clamp(lon, -180, 180)
	x := int(math.Round((lon + 180) / 360 * float64(width-1)))
	y := int(math.Round((90 - lat) / 180 * float64(height-1)))
	return x, y
}

func clamp(val, min, max float64) float64 {
	if val < min {
		return min
	}
	if val > max {
		return max
	}
	return val
}
