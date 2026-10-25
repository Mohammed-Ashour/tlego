package tui

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/pkg/tui/data"
	tea "github.com/charmbracelet/bubbletea"
)

type groupsLoadedMsg struct {
	groups []data.Group
	err    error
}

type groupTLEsLoadedMsg struct {
	query string
	group string
	tles  []tle.TLE
	meta  data.FetchMeta
	err   error
}

type noradLoadedMsg struct {
	noradID string
	tle     tle.TLE
	meta    data.FetchMeta
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

func fetchGroupsCmd(store *data.Store) tea.Cmd {
	return func() tea.Msg {
		groups, err := store.FetchGroups()
		return groupsLoadedMsg{groups: groups, err: err}
	}
}

func fetchGroupTLEsCmd(store *data.Store, group string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		tles, meta, err := store.FetchGroupTLEs(ctx, group)
		return groupTLEsLoadedMsg{group: group, tles: tles, meta: meta, err: err}
	}
}

func fetchGroupSearchCmd(store *data.Store, group, query string) tea.Cmd {
	cmd := fetchGroupTLEsCmd(store, group)
	return func() tea.Msg {
		msg := cmd().(groupTLEsLoadedMsg)
		msg.query = query
		return msg
	}
}

func fetchNoradCmd(store *data.Store, noradID string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		tleData, meta, err := store.FetchTLEByNorad(ctx, noradID)
		return noradLoadedMsg{noradID: noradID, tle: tleData, meta: meta, err: err}
	}
}

func searchAllGroupsCmd(store *data.Store, query string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()
		groups, err := store.FetchGroups()
		if err != nil {
			return searchResultsMsg{err: err}
		}
		query = strings.ToLower(strings.TrimSpace(query))
		if query == "" {
			return searchResultsMsg{results: nil, err: nil}
		}
		var results []TLESummary
		var matched []tle.TLE
		seen := make(map[string]bool)
		failed, stale := 0, 0
		for _, group := range groups {
			tles, meta, err := store.FetchGroupTLEs(ctx, group.Name)
			if err != nil {
				if ctx.Err() != nil {
					return searchResultsMsg{err: ctx.Err()}
				}
				failed++
				continue
			}
			if meta.Stale {
				stale++
			}
			for _, item := range tles {
				if strings.Contains(strings.ToLower(item.Name), query) || strings.Contains(item.NoradID, query) {
					if seen[item.NoradID] {
						continue
					}
					seen[item.NoradID] = true
					matched = append(matched, item)
					results = append(results, summaryFromTLE(item))
				}
			}
		}
		warning := ""
		if failed > 0 || stale > 0 {
			warning = fmt.Sprintf("Search coverage: %d/%d groups loaded, %d using stale data", len(groups)-failed, len(groups), stale)
		}
		return searchResultsMsg{results: results, tles: matched, warning: warning}
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
			Time:   t,
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
		passes := ComputePasses(sat, obs, start, duration, step)
		return passesLoadedMsg{passes: passes}
	}
}

func reportCmd(tleData tle.TLE, sat satellite.Satellite, orbit OrbitInfo, provider, format string) tea.Cmd {
	return func() tea.Msg {
		pos := PositionFromSatellite(sat, time.Now())
		mapURL := MapURL(provider, pos.LatDeg, pos.LonDeg)
		report, err := BuildReport(tleData, pos, orbit, mapURL)
		if err != nil {
			return reportBuiltMsg{err: err}
		}
		output, err := formatReport(report, format)
		if err != nil {
			return reportBuiltMsg{err: err}
		}
		return reportBuiltMsg{report: report, output: output}
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
