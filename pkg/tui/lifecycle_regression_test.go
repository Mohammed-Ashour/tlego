package tui

import (
	"context"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	tea "github.com/charmbracelet/bubbletea"
)

func regressionRecord(t *testing.T) elements.Record {
	t.Helper()
	records, err := elements.ParseGPJSON([]byte(`{"OBJECT_NAME":"TEST","NORAD_CAT_ID":25544,"EPOCH":"2024-01-02T03:04:05","MEAN_MOTION":15.5,"ECCENTRICITY":0.001,"INCLINATION":51.6,"RA_OF_ASC_NODE":20,"ARG_OF_PERICENTER":30,"MEAN_ANOMALY":40,"BSTAR":0.0001,"MEAN_MOTION_DOT":0.00001,"MEAN_MOTION_DDOT":0}`))
	if err != nil {
		t.Fatal(err)
	}
	return records[0]
}

func TestSelectionKeepsGroupMetadata(t *testing.T) {
	m := testModel(t)
	record := regressionRecord(t)
	meta := catalog.FetchMeta{FromCache: true, Warning: "old group"}
	next, _ := m.Update(groupTLEsLoadedMsg{group: "first", records: []elements.Record{record}, meta: meta})
	m = next.(Model)
	next, _ = m.Update(groupTLEsLoadedMsg{group: "other", records: nil, meta: catalog.FetchMeta{Warning: "other group"}})
	m = next.(Model)
	m.applySearch("first", "TEST")
	m.focus = focusResultList
	m.active = screenExplore
	next, _ = m.Update(tea.KeyMsg{Type: tea.KeyEnter})
	m = next.(Model)
	if m.currentEntry == nil || m.currentEntry.Meta.Warning != meta.Warning || !m.currentEntry.Meta.FromCache {
		t.Fatalf("wrong selected metadata: %+v", m.currentEntry)
	}
	if m.warning != meta.Warning {
		t.Fatalf("selected warning = %q", m.warning)
	}
	msg := elementReportCmd(m.currentEntry.Record, m.currentSat, m.currentOrb, "google", "json-v1", m.currentEntry.Meta)().(reportBuiltMsg)
	if msg.err != nil || !strings.Contains(msg.output, "old group") {
		t.Fatalf("report metadata: %s (%v)", msg.output, msg.err)
	}
}

func TestObserverChangeInvalidatesPassesAndOldResult(t *testing.T) {
	m := testModel(t)
	m.setCurrentElement(regressionRecord(t))
	m.setScreen(screenSettings)
	input := passInput{element: m.currentEntry.Record.CatalogID, version: m.elementVersion, observer: m.settings.Observer, start: time.Now(), duration: time.Hour, step: time.Minute}
	m.passResult.input = input
	m.passResult.passes = []Pass{{}}
	m.settingsInputs[2].SetValue("12")
	next, _ := m.Update(tea.KeyMsg{Type: tea.KeyCtrlS})
	m = next.(Model)
	if len(m.passResult.passes) != 0 || !m.passResult.input.start.IsZero() {
		t.Fatal("old passes retained")
	}
	next, _ = m.Update(passesLoadedMsg{input: input, passes: []Pass{{}}})
	m = next.(Model)
	if len(m.passResult.passes) != 0 {
		t.Fatal("old observer result accepted")
	}
}

func TestTrackingRejectsPreviousSessionTick(t *testing.T) {
	m := testModel(t)
	m.setCurrentElement(regressionRecord(t))
	m.setScreen(screenTrack)
	key := tea.KeyMsg{Type: tea.KeySpace}
	m = keyModel(m, key)
	previous := m.trackSession
	m = keyModel(m, key)
	m = keyModel(m, key)
	before := len(m.trackTrail)
	next, cmd := m.Update(trackTickMsg{session: previous, at: time.Now()})
	m = next.(Model)
	if cmd != nil || len(m.trackTrail) != before {
		t.Fatal("previous timer resumed")
	}
}

func TestRequestReplacementAndNavigationCancel(t *testing.T) {
	m := testModel(t)
	var first, second context.Context
	m, _ = m.startContextRequest(func(ctx context.Context) tea.Cmd { first = ctx; return func() tea.Msg { return nil } })
	m, _ = m.startContextRequest(func(ctx context.Context) tea.Cmd { second = ctx; return func() tea.Msg { return nil } })
	if !errors.Is(first.Err(), context.Canceled) || second.Err() != nil {
		t.Fatal("replacement did not cancel only old request")
	}
	m.setScreen(screenHome)
	if !errors.Is(second.Err(), context.Canceled) {
		t.Fatal("navigation did not cancel request")
	}
}

type failingReportTemp struct {
	*os.File
	failWrite, failClose bool
}

func (f failingReportTemp) Write(b []byte) (int, error) {
	if f.failWrite {
		return 0, errors.New("write failed")
	}
	return f.File.Write(b)
}
func (f failingReportTemp) Close() error {
	err := f.File.Close()
	if f.failClose {
		return errors.New("close failed")
	}
	return err
}
func TestReportFailurePreservesExistingFile(t *testing.T) {
	for _, mode := range []string{"write", "close"} {
		t.Run(mode, func(t *testing.T) {
			dir := t.TempDir()
			path := filepath.Join(dir, "report")
			if err := os.WriteFile(path, []byte("original"), 0600); err != nil {
				t.Fatal(err)
			}
			err := writeReportWith(path, []byte("replacement"), func(dir, pattern string) (reportTemp, error) {
				f, err := os.CreateTemp(dir, pattern)
				if err != nil {
					return nil, err
				}
				return failingReportTemp{File: f, failWrite: mode == "write", failClose: mode == "close"}, nil
			})
			if err == nil {
				t.Fatal("expected failure")
			}
			got, err := os.ReadFile(path)
			if err != nil || string(got) != "original" {
				t.Fatalf("existing report %q: %v", got, err)
			}
			entries, err := os.ReadDir(dir)
			if err != nil || len(entries) != 1 {
				t.Fatalf("temporary file left behind: %v %v", entries, err)
			}
		})
	}
}

func TestSearchSelectionUsesEntryMetadata(t *testing.T) {
	m := testModel(t)
	record := regressionRecord(t)
	entry := catalog.ElementEntry{Record: record, Meta: catalog.FetchMeta{Warning: "search source"}}
	next, _ := m.Update(searchResultsMsg{entries: []catalog.ElementEntry{entry}, results: []TLESummary{summaryFromElement(record)}})
	m = next.(Model)
	m.active, m.focus = screenExplore, focusResultList
	next, _ = m.Update(tea.KeyMsg{Type: tea.KeyEnter})
	m = next.(Model)
	if m.currentEntry == nil || m.currentEntry.Meta.Warning != "search source" {
		t.Fatalf("search metadata lost: %+v", m.currentEntry)
	}
}

func TestPassCompletionClearsLoading(t *testing.T) {
	for _, failure := range []bool{false, true} {
		m := testModel(t)
		m.setCurrentElement(regressionRecord(t))
		input := passInput{element: m.currentEntry.Record.CatalogID, version: m.elementVersion, observer: m.settings.Observer, start: time.Now(), duration: time.Hour, step: time.Minute}
		m.loading, m.passesLoading = true, true
		msg := passesLoadedMsg{input: input}
		if failure {
			msg.err = errors.New("sampling failed")
		}
		next, _ := m.Update(msg)
		m = next.(Model)
		if m.loading || m.passesLoading {
			t.Fatalf("loading remains set, failure=%v", failure)
		}
	}
}

type blockingTransport struct {
	started chan struct{}
	stopped chan struct{}
}

func (b blockingTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	close(b.started)
	<-req.Context().Done()
	close(b.stopped)
	return nil, req.Context().Err()
}
func TestFetchTransportCanceled(t *testing.T) {
	for _, action := range []string{"replace", "navigate", "quit", "parent"} {
		t.Run(action, func(t *testing.T) {
			m := testModel(t)
			parent, cancel := context.WithCancel(context.Background())
			defer cancel()
			m.request.parent = parent
			transport := blockingTransport{started: make(chan struct{}), stopped: make(chan struct{})}
			m.store = catalog.NewStoreWithClient(t.TempDir(), 0, &http.Client{Transport: transport})
			m, cmd := m.startContextRequest(func(ctx context.Context) tea.Cmd { return fetchNoradCmd(ctx, m.store, "25544") })
			done := make(chan tea.Msg, 1)
			go func() { done <- cmd() }()
			select {
			case <-transport.started:
			case <-time.After(3 * time.Second):
				t.Fatal("transport did not start")
			}
			switch action {
			case "replace":
				m, _ = m.startContextRequest(func(context.Context) tea.Cmd { return func() tea.Msg { return nil } })
			case "navigate":
				m.setScreen(screenHome)
			case "quit":
				_, _ = m.Update(tea.KeyMsg{Type: tea.KeyCtrlC})
			case "parent":
				cancel()
			}
			select {
			case <-transport.stopped:
			case <-time.After(3 * time.Second):
				t.Fatal("transport not canceled")
			}
			select {
			case <-done:
			case <-time.After(3 * time.Second):
				t.Fatal("command did not finish")
			}
		})
	}
}

type shortReportTemp struct{ *os.File }

func (f shortReportTemp) Write(b []byte) (int, error) { return f.File.Write(b[:len(b)/2]) }
func TestReportReplacementPreservesMode(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "report")
	if err := os.WriteFile(path, []byte("old"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.Chmod(path, 0600); err != nil {
		t.Fatal(err)
	}
	before, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	if err := writeReport(path, "new"); err != nil {
		t.Fatal(err)
	}
	info, err := os.Stat(path)
	if err != nil || info.Mode().Perm() != before.Mode().Perm() {
		t.Fatalf("mode: %v %v", info, err)
	}
	got, err := os.ReadFile(path)
	if err != nil || string(got) != "new" {
		t.Fatalf("contents %q: %v", got, err)
	}
}
func TestReportShortWritePreservesFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "report")
	if err := os.WriteFile(path, []byte("old"), 0600); err != nil {
		t.Fatal(err)
	}
	err := writeReportWith(path, []byte("replacement"), func(dir, pattern string) (reportTemp, error) {
		f, err := os.CreateTemp(dir, pattern)
		if err != nil {
			return nil, err
		}
		return shortReportTemp{f}, nil
	})
	if !errors.Is(err, io.ErrShortWrite) {
		t.Fatalf("expected short write, got %v", err)
	}
	got, err := os.ReadFile(path)
	if err != nil || string(got) != "old" {
		t.Fatalf("contents %q: %v", got, err)
	}
	entries, err := os.ReadDir(dir)
	if err != nil || len(entries) != 1 {
		t.Fatalf("leftover files %v: %v", entries, err)
	}
}
func TestReportRenameFailureCleansTemporaryFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "report")
	if err := os.Mkdir(path, 0700); err != nil {
		t.Fatal(err)
	}
	if err := writeReport(path, "replacement"); err == nil {
		t.Fatal("expected rename failure")
	}
	entries, err := os.ReadDir(dir)
	if err != nil || len(entries) != 1 || !entries[0].IsDir() {
		t.Fatalf("directory contents %v: %v", entries, err)
	}
}
