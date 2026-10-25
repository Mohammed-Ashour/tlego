package tui

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	tea "github.com/charmbracelet/bubbletea"
)

type groupsLoadedMsg struct {
	groups []catalog.Group
	err    error
}

type groupTLEsLoadedMsg struct {
	query string
	group string
	tles  []tle.TLE
	meta  catalog.FetchMeta
	err   error
}

type noradLoadedMsg struct {
	noradID string
	tle     tle.TLE
	meta    catalog.FetchMeta
	err     error
}

type searchResultsMsg struct {
	tles    []tle.TLE
	warning string
	results []TLESummary
	err     error
}

type trackTickMsg time.Time

type predictDoneMsg struct {
	result PredictResult
	err    error
}

type passesLoadedMsg struct {
	passes []Pass
	err    error
}

type reportBuiltMsg struct {
	report ReportData
	output string
	err    error
}

func fetchGroupsCmd(store *catalog.Store) tea.Cmd {
	return func() tea.Msg {
		groups, err := store.FetchGroups()
		return groupsLoadedMsg{groups: groups, err: err}
	}
}

func fetchGroupTLEsCmd(store *catalog.Store, group string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		tles, meta, err := store.FetchGroupTLEs(ctx, group)
		return groupTLEsLoadedMsg{group: group, tles: tles, meta: meta, err: err}
	}
}

func fetchGroupSearchCmd(store *catalog.Store, group, query string) tea.Cmd {
	cmd := fetchGroupTLEsCmd(store, group)
	return func() tea.Msg {
		msg := cmd().(groupTLEsLoadedMsg)
		msg.query = query
		return msg
	}
}

func fetchNoradCmd(store *catalog.Store, noradID string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		tleData, meta, err := store.FetchTLEByNorad(ctx, noradID)
		return noradLoadedMsg{noradID: noradID, tle: tleData, meta: meta, err: err}
	}
}

func searchAllGroupsCmd(store *catalog.Store, query string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()
		result, err := store.Search(ctx, query)
		if err != nil {
			return searchResultsMsg{err: err}
		}
		results := make([]TLESummary, 0, len(result.TLEs))
		for _, item := range result.TLEs {
			results = append(results, summaryFromTLE(item))
		}
		warning := ""
		if len(result.Warnings) > 0 {
			warning = fmt.Sprintf("Search coverage: %d/%d groups loaded. %s", result.GroupsCovered, result.GroupsTotal, strings.Join(result.Warnings, "; "))
		}
		return searchResultsMsg{results: results, tles: result.TLEs, warning: warning}
	}
}

func trackTickCmd(interval time.Duration) tea.Cmd {
	return tea.Tick(interval, func(t time.Time) tea.Msg {
		return trackTickMsg(t)
	})
}

func predictCmd(sat satellite.Satellite, t time.Time, provider string) tea.Cmd {
	return func() tea.Msg {
		pos := PositionFromSatellite(sat, t)
		result := PredictResult{
			Time:   pos.Time,
			LatDeg: pos.LatDeg,
			LonDeg: pos.LonDeg,
			AltKm:  pos.AltKm,
			MapURL: MapURL(provider, pos.LatDeg, pos.LonDeg),
		}
		return predictDoneMsg{result: result}
	}
}

func passesCmd(sat satellite.Satellite, obs Observer, start time.Time, duration, step time.Duration) tea.Cmd {
	return func() tea.Msg {
		passes, err := orbit.PlanPasses(sat, obs, start, duration, step)
		return passesLoadedMsg{passes: passes, err: err}
	}
}

func reportCmd(tleData tle.TLE, sat satellite.Satellite, orbit OrbitInfo, provider, format string, meta catalog.FetchMeta) tea.Cmd {
	return func() tea.Msg {
		pos := PositionFromSatellite(sat, time.Now())
		mapURL := MapURL(provider, pos.LatDeg, pos.LonDeg)
		report, err := BuildReport(tleData, pos, orbit, mapURL)
		if err != nil {
			return reportBuiltMsg{err: err}
		}
		encoded, err := formatReport(report, format)
		if format == "json-v1" {
			fetched := meta.FetchedAt.UTC()
			provenance := output.Provenance{Source: "celestrak", SourceFormat: "tle", ElementEpoch: report.Epoch, CacheStatus: "fetched"}
			if !meta.FetchedAt.IsZero() {
				provenance.FetchedAt = &fetched
			} else {
				provenance.Source = "unknown"
				provenance.CacheStatus = "unknown"
			}
			if meta.FromCache {
				provenance.CacheStatus = "fresh"
			}
			if meta.Stale {
				provenance.CacheStatus = "stale"
			}
			var warnings []output.Warning
			if meta.Warning != "" {
				warnings = append(warnings, output.Warning{Code: "stale_elements", Message: meta.Warning})
			}
			var bytes []byte
			bytes, err = output.MarshalResult("report", output.ReportV1(report), provenance, warnings)
			encoded = string(bytes)
		}
		if err != nil {
			return reportBuiltMsg{err: err}
		}
		return reportBuiltMsg{report: report, output: encoded}
	}
}

func formatReport(report ReportData, format string) (string, error) {
	switch format {
	case "json":
		data, err := FormatReportJSON(report)
		if err != nil {
			return "", err
		}
		return string(data), nil
	case "csv":
		return FormatReportCSV(report)
	default:
		return FormatReportText(report), nil
	}
}
