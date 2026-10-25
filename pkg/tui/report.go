package tui

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

type ReportData struct {
	Name      string    `json:"name"`
	NoradID   string    `json:"norad_id"`
	Epoch     time.Time `json:"epoch"`
	Generated time.Time `json:"generated_at"`
	TLE       string    `json:"tle"`
	Position  Position  `json:"position"`
	Orbit     OrbitInfo `json:"orbit"`
	MapURL    string    `json:"map_url"`
}

func BuildReport(tle tle.TLE, position Position, orbit OrbitInfo, mapURL string) (ReportData, error) {
	epoch, err := tle.Time()
	if err != nil {
		return ReportData{}, err
	}
	return ReportData{
		Name:      tle.Name,
		NoradID:   tle.NoradID,
		Epoch:     epoch,
		Generated: time.Now().UTC(),
		TLE:       tle.String(),
		Position:  position,
		Orbit:     orbit,
		MapURL:    mapURL,
	}, nil
}

func FormatReportText(report ReportData) string {
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
`,
		report.Name,
		report.NoradID,
		report.Epoch.Format(time.RFC3339),
		report.Generated.Format(time.RFC3339),
		report.TLE,
		report.Orbit.InclinationDeg,
		report.Orbit.Eccentricity,
		report.Orbit.MeanMotion,
		report.Orbit.PeriodMinutes,
		report.Orbit.ApogeeKm,
		report.Orbit.PerigeeKm,
		report.Position.Time.Format(time.RFC3339),
		report.Position.LatDeg,
		report.Position.LonDeg,
		report.Position.AltKm,
		report.Position.VelocityKm,
		report.MapURL,
	)
}

func FormatReportJSON(report ReportData) ([]byte, error) {
	return json.MarshalIndent(report, "", "  ")
}

func FormatReportCSV(report ReportData) (string, error) {
	builder := &strings.Builder{}
	writer := csv.NewWriter(builder)
	header := []string{
		"name", "norad_id", "epoch", "generated_at",
		"lat_deg", "lon_deg", "alt_km", "velocity_km_s",
		"inclination_deg", "eccentricity", "mean_motion",
		"period_minutes", "apogee_km", "perigee_km",
		"map_url",
	}
	if err := writer.Write(header); err != nil {
		return "", err
	}
	row := []string{
		report.Name,
		report.NoradID,
		report.Epoch.Format(time.RFC3339),
		report.Generated.Format(time.RFC3339),
		fmt.Sprintf("%.6f", report.Position.LatDeg),
		fmt.Sprintf("%.6f", report.Position.LonDeg),
		fmt.Sprintf("%.3f", report.Position.AltKm),
		fmt.Sprintf("%.3f", report.Position.VelocityKm),
		fmt.Sprintf("%.4f", report.Orbit.InclinationDeg),
		fmt.Sprintf("%.6f", report.Orbit.Eccentricity),
		fmt.Sprintf("%.6f", report.Orbit.MeanMotion),
		fmt.Sprintf("%.2f", report.Orbit.PeriodMinutes),
		fmt.Sprintf("%.2f", report.Orbit.ApogeeKm),
		fmt.Sprintf("%.2f", report.Orbit.PerigeeKm),
		report.MapURL,
	}
	if err := writer.Write(row); err != nil {
		return "", err
	}
	writer.Flush()
	if err := writer.Error(); err != nil {
		return "", err
	}
	return builder.String(), nil
}
