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
	return renderWorldMapShaded(points, width, height, nil)
}

// renderWorldMapShaded marks cells where night reports true with a dot.
func renderWorldMapShaded(points []Position, width, height int, night func(latDeg, lonDeg float64) bool) string {
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
			if night != nil {
				lat, lon := gridToMap(j, i, width, height)
				if night(lat, lon) {
					grid[i][j] = '.'
				}
			}
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

func gridToMap(x, y, width, height int) (lat, lon float64) {
	return 90 - float64(y)/float64(height-1)*180, float64(x)/float64(width-1)*360 - 180
}

// renderSkyView draws a polar sky plot with north at the top and east on the
// right. The rim is the horizon, the inner ring is 45° and the centre is overhead.
func renderSkyView(track []orbit.LookPoint, radius int) string {
	if radius < 4 {
		radius = 4
	}
	height, width := 2*radius+1, 4*radius+1
	grid := make([][]rune, height)
	for y := range grid {
		grid[y] = []rune(strings.Repeat(" ", width))
	}
	place := func(azimuthDeg, zenithFraction float64, mark rune) {
		az := azimuthDeg * math.Pi / 180
		x := radius*2 + int(math.Round(zenithFraction*float64(radius)*2*math.Sin(az)))
		y := radius - int(math.Round(zenithFraction*float64(radius)*math.Cos(az)))
		if y >= 0 && y < height && x >= 0 && x < width {
			grid[y][x] = mark
		}
	}
	for az := 0.0; az < 360; az += 3 {
		place(az, 1, '.')
		place(az, 0.5, '.')
	}
	place(0, 1, 'N')
	place(90, 1, 'E')
	place(180, 1, 'S')
	place(270, 1, 'W')
	place(0, 0, '+')
	skyFraction := func(elevationDeg float64) float64 { return (90 - clamp(elevationDeg, 0, 90)) / 90 }
	peak := -1
	for i, point := range track {
		place(point.AzimuthDeg, skyFraction(point.ElevationDeg), '*')
		if peak < 0 || point.ElevationDeg > track[peak].ElevationDeg {
			peak = i
		}
	}
	if len(track) > 0 {
		place(track[peak].AzimuthDeg, skyFraction(track[peak].ElevationDeg), '@')
		place(track[0].AzimuthDeg, skyFraction(track[0].ElevationDeg), 'o')
		last := track[len(track)-1]
		place(last.AzimuthDeg, skyFraction(last.ElevationDeg), 'x')
	}
	var b strings.Builder
	for y, row := range grid {
		b.WriteString(strings.TrimRight(string(row), " "))
		if y < height-1 {
			b.WriteString("\n")
		}
	}
	return b.String()
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
