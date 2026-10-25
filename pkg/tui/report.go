package tui

import (
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"time"
)

type ReportData = output.ReportData

func BuildReport(element tle.TLE, position Position, orb OrbitInfo, mapURL string) (ReportData, error) {
	return output.BuildReportAt(element, position, orb, mapURL, time.Now())
}
func BuildReportAt(element tle.TLE, position Position, orb OrbitInfo, mapURL string, generated time.Time) (ReportData, error) {
	return output.BuildReportAt(element, position, orb, mapURL, generated)
}
func FormatReportText(r ReportData) string          { return output.FormatReportText(r) }
func FormatReportJSON(r ReportData) ([]byte, error) { return output.FormatReportJSON(r) }
func FormatReportCSV(r ReportData) (string, error)  { return output.FormatReportCSV(r) }
