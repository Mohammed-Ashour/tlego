package visual

import (
	"fmt"
	"os"
	"text/template"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

// Point represents a satellite position with an associated timestamp.

// SatelliteData represents a single satellite's data
type SatelliteData struct {
	Name   string
	Points []Point
	Color  string // Hex color code
}

func GetTLETime(t tle.TLE) time.Time {
	epochYear := tle.ParseInt(t.Line1.EpochYear)
	year := 2000 + epochYear
	day := tle.ParseFloat(t.Line1.EpochDay)
	month, d, hour, min, sec := tle.Days2mdhms(year, day)
	return time.Date(int(year), time.Month(month), d, hour, min, int(sec), 0, time.UTC)
}

func CreateOrbitPoints(tle tle.TLE, numPoints int) ([]Point, error) {
	sat := satellite.NewSatelliteFromTLE(tle, satellite.GravityWGS84)

	// Calculate orbital period (in minutes).
	// Sample points for one complete orbit (uniformly).
	points := make([]Point, 0, numPoints)
	epochTime := GetTLETime(tle)
	for i := 0; i < numPoints; i++ {
		// Uniformly distribute points across the entire orbital period.
		timeOffset := float64(i) * (1440.0 / float64(numPoints))
		// Calculate the epoch time for the satellite.

		epoch := epochTime.Add(time.Duration(timeOffset * float64(time.Minute)))
		position, _ := satellite.Propagate(sat, epoch.Year(), int(epoch.Month()), epoch.Day(),
			epoch.Hour(), epoch.Minute(), int(epoch.Second()))

		// Scale position relative to Earth's radius (6371 km),
		// so Earth is drawn as a sphere of radius 1 in Three.js.
		scaleFactor := 1.0 / 6371.0
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

	// Parse and execute template
	tmpl, err := template.ParseFiles("templates/orbit.html")
	if err != nil {
		fmt.Println("Error parsing template:", err)
		return ""
	}

	htmlFileName = htmlFileName + ".html"
	file, err := os.Create(htmlFileName)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return ""
	}
	defer file.Close()

	if err := tmpl.Execute(file, data); err != nil {
		fmt.Println("Error executing template:", err)
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
