package tui

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	tea "github.com/charmbracelet/bubbletea"
)

type groupsLoadedMsg struct {
	groups []catalog.Group
	err    error
}

type groupTLEsLoadedMsg struct {
	query   string
	group   string
	records []elements.Record
	meta    catalog.FetchMeta
	err     error
}

type noradLoadedMsg struct {
	noradID string
	record  elements.Record
	meta    catalog.FetchMeta
	err     error
}

type searchResultsMsg struct {
	entries []catalog.ElementEntry
	warning string
	results []TLESummary
	err     error
}

type trackTickMsg struct {
	at      time.Time
	session uint64
}

type predictDoneMsg struct {
	result PredictResult
	err    error
}

type passesLoadedMsg struct {
	passes []Pass
	input  passInput
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

func fetchGroupTLEsCmd(ctx context.Context, store *catalog.Store, group string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()
		records, meta, err := store.FetchGroupElements(ctx, group)
		return groupTLEsLoadedMsg{group: group, records: records, meta: meta, err: err}
	}
}

func fetchGroupSearchCmd(ctx context.Context, store *catalog.Store, group, query string) tea.Cmd {
	cmd := fetchGroupTLEsCmd(ctx, store, group)
	return func() tea.Msg {
		msg := cmd().(groupTLEsLoadedMsg)
		msg.query = query
		return msg
	}
}

func fetchNoradCmd(ctx context.Context, store *catalog.Store, noradID string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()
		record, meta, err := store.FetchElementByNorad(ctx, noradID)
		return noradLoadedMsg{noradID: noradID, record: record, meta: meta, err: err}
	}
}

func searchAllGroupsCmd(ctx context.Context, store *catalog.Store, query string) tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
		defer cancel()
		result, err := store.SearchElements(ctx, query)
		if err != nil {
			return searchResultsMsg{err: err}
		}
		results := make([]TLESummary, 0, len(result.Records))
		for _, item := range result.Records {
			results = append(results, summaryFromElement(item))
		}
		warning := ""
		if len(result.Warnings) > 0 {
			warning = fmt.Sprintf("Search coverage: %d/%d groups loaded. %s", result.GroupsCovered, result.GroupsTotal, strings.Join(result.Warnings, "; "))
		}
		return searchResultsMsg{results: results, entries: result.Entries, warning: warning}
	}
}

func trackTickCmd(interval time.Duration, session uint64) tea.Cmd {
	return tea.Tick(interval, func(t time.Time) tea.Msg {
		return trackTickMsg{at: t, session: session}
	})
}

func predictCmd(sat *orbit.Propagator, t time.Time, provider string) tea.Cmd {
	return func() tea.Msg {
		state, err := sat.At(t)
		if err != nil {
			return predictDoneMsg{err: err}
		}
		pos := positionFromState(state)
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

func passesCmd(ctx context.Context, sat *orbit.Propagator, input passInput) tea.Cmd {
	return func() tea.Msg {
		passes, err := orbit.PlanPassesElementsContext(ctx, sat, input.observer, input.start, input.duration, input.step)
		return passesLoadedMsg{passes: passes, input: input, err: err}
	}
}

func elementReportCmd(record elements.Record, sat *orbit.Propagator, orb OrbitInfo, provider, format string, meta catalog.FetchMeta) tea.Cmd {
	return func() tea.Msg {
		state, err := sat.At(time.Now())
		if err != nil {
			return reportBuiltMsg{err: err}
		}
		pos := positionFromState(state)
		mapURL := MapURL(provider, pos.LatDeg, pos.LonDeg)
		report, err := output.BuildElementReportAt(record, pos, orb, mapURL, time.Now())
		if err != nil {
			return reportBuiltMsg{err: err}
		}
		encoded, err := formatReport(report, format)
		if err != nil {
			return reportBuiltMsg{err: err}
		}
		if format == "json-v1" {
			fetched := meta.FetchedAt.UTC()
			provenance := output.Provenance{Source: "celestrak", SourceFormat: record.SourceFormat, ElementEpoch: report.Epoch, CacheStatus: "fetched"}
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
			var b []byte
			b, err = output.MarshalResult("report", output.ReportV1(report), provenance, warnings)
			encoded = string(b)
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
