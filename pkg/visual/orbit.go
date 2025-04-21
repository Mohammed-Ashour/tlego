package visual

import (
	"fmt"
	"os"
	"text/template"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/pkg/templates"
)

// Point represents a satellite position with an associated timestamp.

// SatelliteData represents a single satellite's data
type SatelliteData struct {
	Name   string
	Points []Point
	Color  string // Hex color code
}

func CreateOrbitPoints(t tle.TLE, numPoints int) ([]Point, error) {
	sat := satellite.NewSatelliteFromTLE(t, satellite.GravityWGS84)

	// Calculate orbital period from mean motion (revs per day)
	meanMotion := tle.ParseFloat(t.Line2.MeanMotion)
	if meanMotion <= 0 {
		return nil, fmt.Errorf("invalid mean motion: %v", meanMotion)
	}

	// Convert to minutes per orbit
	minutesPerOrbit := 24.0 * 60.0 / meanMotion

	points := make([]Point, 0, numPoints)
	epochTime, err := t.Time()
	if err != nil {
		return nil, fmt.Errorf("failed to get epoch time: %v", err)
	}

	// Distribute points evenly across one complete orbit
	for i := 0; i < numPoints; i++ {
		// Calculate time offset for this point
		timeOffset := (float64(i) * minutesPerOrbit) / float64(numPoints)
		epoch := epochTime.Add(time.Duration(timeOffset * float64(time.Minute)))
		position, _ := satellite.Propagate(sat, epoch.Year(), int(epoch.Month()), epoch.Day(),
			epoch.Hour(), epoch.Minute(), int(epoch.Second()))

		// Scale position relative to Earth's radius (6371 km)
		scaleFactor := 0.05 / 6371.0 // Updated scale factor to use actual Earth radius
		points = append(points, Point{
			X:    position.X * scaleFactor,
			Y:    position.Y * scaleFactor,
			Z:    position.Z * scaleFactor,
			Time: epoch,
		})
	}
	return points, nil
}

// Modified CreateHTMLVisual to accept multiple satellites
func CreateHTMLVisual(satellites []SatelliteData, htmlFileName string) string {
	// Convert satellites data to JS array
	satellitesJS := "["
	for i, sat := range satellites {
		if i > 0 {
			satellitesJS += ","
		}
		satellitesJS += fmt.Sprintf(`{
            name: %q,
            color: %q,
            points: %s
        }`, sat.Name, sat.Color, pointsToJSArray(sat.Points))
	}
	satellitesJS += "]"

	// Create template data
	data := struct {
		SatellitesJS string
	}{
		SatellitesJS: satellitesJS,
	}

	// Parse embedded template
	tmpl, err := template.ParseFS(templates.FS, templates.OrbitTemplate)
	if err != nil {
		fmt.Printf("Error parsing template: %v\n", err)
		return ""
	}

	htmlFileName = htmlFileName + ".html"
	file, err := os.Create(htmlFileName)
	if err != nil {
		fmt.Printf("Error creating file: %v\n", err)
		return ""
	}
	defer file.Close()

	if err := tmpl.Execute(file, data); err != nil {
		fmt.Printf("Error executing template: %v\n", err)
		return ""
	}

	return htmlFileName
}

// pointsToJSArray formats the orbit points into a valid JavaScript array literal.
func pointsToJSArray(points []Point) string {
	if len(points) == 0 {
		return "[]"
	}

	js := "["
	for i, p := range points {
		if i > 0 {
			js += ","
		}
		js += fmt.Sprintf(`{X:%.6f,Y:%.6f,Z:%.6f}`, p.X, p.Y, p.Z)
	}
	js += "]"
	return js
}
