package visual

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/pkg/templates"
)

const (
	maxOrbitPoints = 4096
	maxSatellites  = 64
	maxSamples     = 250000
	earthRadiusKm  = 6378.137
	decayRadiusKm  = 6356.0
)

var hexColor = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// SatelliteData describes one satellite and its sampled TEME orbit.
type SatelliteData struct {
	Name    string    `json:"name"`
	NORADID string    `json:"norad_id"`
	Epoch   time.Time `json:"epoch"`
	Color   string    `json:"color"`
	Points  []Point   `json:"points"`
}

// CreateOrbitPoints retains the original helper and samples one period from
// the TLE epoch. New callers that need a shared timeline should use
// CreateOrbitPointsAt.
func CreateOrbitPoints(t tle.TLE, numPoints int) ([]Point, error) {
	epoch, err := t.Time()
	if err != nil {
		return nil, fmt.Errorf("invalid TLE epoch: %w", err)
	}
	return CreateOrbitPointsAt(t, numPoints, epoch)
}

// CreateOrbitPointsAt samples one mean-motion period, including both endpoints.
// Propagation timestamps are UTC and truncated to whole seconds.
func CreateOrbitPointsAt(t tle.TLE, numPoints int, start time.Time) ([]Point, error) {
	if numPoints < 2 || numPoints > maxOrbitPoints {
		return nil, fmt.Errorf("point count must be between 2 and %d", maxOrbitPoints)
	}
	if start.IsZero() {
		return nil, fmt.Errorf("start time is required")
	}
	start = start.UTC().Truncate(time.Second)
	if err := validateTLE(t); err != nil {
		return nil, err
	}
	meanMotion, err := strconv.ParseFloat(strings.TrimSpace(t.Line2.MeanMotion), 64)
	if err != nil || !finite(meanMotion) || meanMotion <= 0 {
		return nil, fmt.Errorf("invalid mean motion %q", t.Line2.MeanMotion)
	}
	periodSeconds := 86400.0 / meanMotion
	if !finite(periodSeconds) || periodSeconds >= float64(math.MaxInt64)/float64(time.Second) || periodSeconds < float64(numPoints-1) {
		return nil, fmt.Errorf("orbit period %.3f seconds cannot support %d one-second samples", periodSeconds, numPoints)
	}
	period := time.Duration(periodSeconds * float64(time.Second))
	if period <= 0 {
		return nil, fmt.Errorf("invalid orbit period")
	}

	var sat satellite.Satellite
	if err := safely("initialize propagator", func() { sat = satellite.NewSatelliteFromTLE(t, satellite.GravityWGS84) }); err != nil {
		return nil, err
	}
	points := make([]Point, 0, numPoints)
	var previous time.Time
	for i := 0; i < numPoints; i++ {
		// Integer duration division makes endpoint inclusion deterministic while
		// retaining the propagator's one-second time resolution.
		offset := time.Duration(float64(period) * (float64(i) / float64(numPoints-1)))
		sampleTime := start.Add(offset).UTC().Truncate(time.Second)
		if i > 0 && !sampleTime.After(previous) {
			return nil, fmt.Errorf("point count exceeds one-second sample resolution")
		}
		previous = sampleTime
		var p Point
		var radius float64
		if err := safely("propagate orbit", func() {
			state := orbit.At(sat, sampleTime)
			position := state.PositionTEMEKm
			radius = math.Sqrt(position.X*position.X + position.Y*position.Y + position.Z*position.Z)
			p = Point{
				X: position.X, Y: position.Y, Z: position.Z, Time: state.Time,
				LatitudeDeg: state.LatDeg, LongitudeDeg: state.LonDeg,
				AltitudeKm: state.AltKm, SpeedKmS: state.SpeedKmS, GMSTRad: state.GMSTRad,
			}
		}); err != nil {
			return nil, fmt.Errorf("sample %d at %s: %w", i, sampleTime.Format(time.RFC3339), err)
		}
		if !finite(radius) || radius <= decayRadiusKm || p.AltitudeKm < 0 || !pointFinite(p) {
			return nil, fmt.Errorf("sample %d at %s returned invalid or decayed coordinates", i, sampleTime.Format(time.RFC3339))
		}
		points = append(points, p)
	}
	return points, nil
}

func validateTLE(t tle.TLE) error {
	_, err := catalog.ParseTLE([]byte(t.String()))
	return err
}

func safely(label string, fn func()) (err error) {
	defer func() {
		if recovered := recover(); recovered != nil {
			err = fmt.Errorf("%s failed: %v", label, recovered)
		}
	}()
	fn()
	return nil
}

func finite(v float64) bool { return !math.IsNaN(v) && !math.IsInf(v, 0) }

func pointFinite(p Point) bool {
	return !p.Time.IsZero() && finite(p.X) && finite(p.Y) && finite(p.Z) &&
		finite(p.LatitudeDeg) && finite(p.LongitudeDeg) && finite(p.AltitudeKm) &&
		finite(p.SpeedKmS) && finite(p.GMSTRad)
}

type orbitDocument struct {
	SchemaVersion int             `json:"schema_version"`
	GeneratedAt   time.Time       `json:"generated_at"`
	Frame         string          `json:"frame"`
	Units         string          `json:"units"`
	EarthRadiusKm float64         `json:"earth_radius_km"`
	Satellites    []SatelliteData `json:"satellites"`
}

// WriteHTMLVisual renders and atomically writes a validated, self-contained
// orbit viewer. The returned string is the resulting path.
func WriteHTMLVisual(satellites []SatelliteData, path string) (string, error) {
	if len(satellites) == 0 || len(satellites) > maxSatellites {
		return "", fmt.Errorf("satellite count must be between 1 and %d", maxSatellites)
	}
	data := append([]SatelliteData(nil), satellites...)
	count := 0
	var overlapStart, overlapEnd time.Time
	for i := range data {
		s := &data[i]
		s.Points = append([]Point(nil), s.Points...)
		if len(s.Points) < 2 {
			return "", fmt.Errorf("satellite %d needs at least two points", i)
		}
		if strings.TrimSpace(s.Name) == "" {
			s.Name = fmt.Sprintf("Satellite %d", i+1)
			if s.NORADID != "" {
				s.Name = "NORAD " + s.NORADID
			}
		}
		count += len(s.Points)
		if count > maxSamples {
			return "", fmt.Errorf("orbit export exceeds %d total samples", maxSamples)
		}
		if !s.Epoch.IsZero() {
			s.Epoch = s.Epoch.UTC()
		}
		if !hexColor.MatchString(s.Color) {
			s.Color = fallbackColor(i)
		}
		for j, p := range s.Points {
			p.Time = p.Time.UTC()
			s.Points[j] = p
			if !pointFinite(p) || p.AltitudeKm < 0 || math.Sqrt(p.X*p.X+p.Y*p.Y+p.Z*p.Z) <= decayRadiusKm || p.LatitudeDeg < -90 || p.LatitudeDeg > 90 || p.LongitudeDeg < -180 || p.LongitudeDeg >= 180 || p.SpeedKmS <= 0 {
				return "", fmt.Errorf("satellite %q point %d has invalid or non-finite data", s.Name, j)
			}
			if j > 0 && !p.Time.After(s.Points[j-1].Time) {
				return "", fmt.Errorf("satellite %q point times must be strictly increasing", s.Name)
			}
		}
		first, last := s.Points[0].Time, s.Points[len(s.Points)-1].Time
		if i == 0 || first.After(overlapStart) {
			overlapStart = first
		}
		if i == 0 || last.Before(overlapEnd) {
			overlapEnd = last
		}
	}
	if !overlapStart.Before(overlapEnd) {
		return "", fmt.Errorf("satellite timelines have no common overlapping interval")
	}
	if strings.TrimSpace(path) == "" {
		return "", fmt.Errorf("output path is required")
	}
	doc := orbitDocument{1, time.Now().UTC(), "TEME", "km", earthRadiusKm, data}
	payload, err := json.Marshal(doc)
	if err != nil {
		return "", fmt.Errorf("marshal orbit data: %w", err)
	}
	view := struct {
		Payload template.JS
		CSS     template.CSS
		JS      template.JS
	}{template.JS(payload), template.CSS(templates.ViewerCSS), template.JS(templates.ViewerJS)}
	tmpl, err := template.ParseFS(templates.FS, templates.OrbitTemplate)
	if err != nil {
		return "", fmt.Errorf("parse orbit template: %w", err)
	}
	var rendered bytes.Buffer
	if err := tmpl.Execute(&rendered, view); err != nil {
		return "", fmt.Errorf("render orbit template: %w", err)
	}
	if err := writeAtomically(path, rendered.Bytes()); err != nil {
		return "", err
	}
	return path, nil
}

func fallbackColor(index int) string {
	palette := [...]string{"#66ccff", "#ff8066", "#9be564", "#d69cff", "#ffd166", "#72e0c1", "#f28cb1", "#b8c0ff"}
	return palette[index%len(palette)]
}

func writeAtomically(path string, contents []byte) error {
	dir := filepath.Dir(path)
	file, err := os.CreateTemp(dir, ".orbit-*.html.tmp")
	if err != nil {
		return fmt.Errorf("create temporary HTML file: %w", err)
	}
	tempName := file.Name()
	defer os.Remove(tempName)
	if err := file.Chmod(0644); err != nil {
		_ = file.Close()
		return err
	}
	if _, err := file.Write(contents); err != nil {
		_ = file.Close()
		return fmt.Errorf("write HTML: %w", err)
	}
	if err := file.Close(); err != nil {
		return fmt.Errorf("close HTML: %w", err)
	}
	if err := os.Rename(tempName, path); err != nil {
		return fmt.Errorf("replace HTML file: %w", err)
	}
	return nil
}

// CreateHTMLVisual is retained for source compatibility. Prefer
// WriteHTMLVisual to receive validation and filesystem errors.
//
// Deprecated: use WriteHTMLVisual.
func CreateHTMLVisual(satellites []SatelliteData, htmlFileName string) string {
	if !strings.EqualFold(filepath.Ext(htmlFileName), ".html") {
		htmlFileName += ".html"
	}
	path, err := WriteHTMLVisual(satellites, htmlFileName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating orbit visualization: %v\n", err)
		return ""
	}
	return path
}
