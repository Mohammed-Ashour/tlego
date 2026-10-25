// Package output contains reusable legacy report construction and encoders.
package output

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
)

type ReportData struct {
	Name      string          `json:"name"`
	NoradID   string          `json:"norad_id"`
	Epoch     time.Time       `json:"epoch"`
	Generated time.Time       `json:"generated_at"`
	TLE       string          `json:"tle"`
	Position  orbit.Position  `json:"position"`
	Orbit     orbit.OrbitInfo `json:"orbit"`
	MapURL    string          `json:"map_url"`
}

func BuildReportAt(element tle.TLE, position orbit.Position, orb orbit.OrbitInfo, mapURL string, generated time.Time) (ReportData, error) {
	epoch, err := element.Time()
	if err != nil {
		return ReportData{}, err
	}
	return ReportData{Name: element.Name, NoradID: element.NoradID, Epoch: epoch, Generated: generated.UTC(), TLE: element.String(), Position: position, Orbit: orb, MapURL: mapURL}, nil
}
func FormatReportText(r ReportData) string {
	return fmt.Sprintf(`
Satellite Report
================
Name: %s
NORAD ID: %s
Epoch: %s
Generated: %s

TLE Data:
---------
%s

Orbital Parameters:
--------------------
Inclination: %.4f°
Eccentricity: %.6f
Mean Motion: %.6f rev/day
Period: %.2f minutes
Apogee: %.2f km
Perigee: %.2f km

Current Position:
-----------------
Time: %s
Latitude: %.6f°
Longitude: %.6f°
Altitude: %.3f km
Velocity: %.3f km/s

Map URL:
--------
%s
`, r.Name, r.NoradID, r.Epoch.Format(time.RFC3339), r.Generated.Format(time.RFC3339), r.TLE, r.Orbit.InclinationDeg, r.Orbit.Eccentricity, r.Orbit.MeanMotion, r.Orbit.PeriodMinutes, r.Orbit.ApogeeKm, r.Orbit.PerigeeKm, r.Position.Time.Format(time.RFC3339), r.Position.LatDeg, r.Position.LonDeg, r.Position.AltKm, r.Position.VelocityKm, r.MapURL)
}
func FormatReportJSON(r ReportData) ([]byte, error) { return json.MarshalIndent(r, "", "  ") }
func FormatReportCSV(r ReportData) (string, error) {
	b := &strings.Builder{}
	w := csv.NewWriter(b)
	if err := w.Write([]string{"name", "norad_id", "epoch", "generated_at", "lat_deg", "lon_deg", "alt_km", "velocity_km_s", "inclination_deg", "eccentricity", "mean_motion", "period_minutes", "apogee_km", "perigee_km", "map_url"}); err != nil {
		return "", err
	}
	row := []string{r.Name, r.NoradID, r.Epoch.Format(time.RFC3339), r.Generated.Format(time.RFC3339), fmt.Sprintf("%.6f", r.Position.LatDeg), fmt.Sprintf("%.6f", r.Position.LonDeg), fmt.Sprintf("%.3f", r.Position.AltKm), fmt.Sprintf("%.3f", r.Position.VelocityKm), fmt.Sprintf("%.4f", r.Orbit.InclinationDeg), fmt.Sprintf("%.6f", r.Orbit.Eccentricity), fmt.Sprintf("%.6f", r.Orbit.MeanMotion), fmt.Sprintf("%.2f", r.Orbit.PeriodMinutes), fmt.Sprintf("%.2f", r.Orbit.ApogeeKm), fmt.Sprintf("%.2f", r.Orbit.PerigeeKm), r.MapURL}
	if err := w.Write(row); err != nil {
		return "", err
	}
	w.Flush()
	if err := w.Error(); err != nil {
		return "", err
	}
	return b.String(), nil
}
