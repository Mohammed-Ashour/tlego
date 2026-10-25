package tui

import (
	"bytes"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/pkg/tui/data"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/muesli/reflow/ansi"
)

func testModel(t *testing.T) Model {
	t.Helper()
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	return NewModel(Options{}, DefaultSettings(), data.NewStore(t.TempDir(), 0), nil)
}

func TestTUILoadsNineDigitGPRecordWithoutSynthesizingTLE(t *testing.T) {
	input := []byte(`{"OBJECT_NAME":"LARGE ID TEST","NORAD_CAT_ID":234567890,"EPOCH":"2024-01-02T03:04:05.123456","MEAN_MOTION":15.5,"ECCENTRICITY":0.001,"INCLINATION":51.6,"RA_OF_ASC_NODE":20,"ARG_OF_PERICENTER":30,"MEAN_ANOMALY":40,"BSTAR":0.0001,"MEAN_MOTION_DOT":0.00001,"MEAN_MOTION_DDOT":0}`)
	records, err := elements.ParseGPJSON(input)
	if err != nil {
		t.Fatal(err)
	}
	m := testModel(t)
	m.setCurrentElement(records[0])
	if m.currentTLE == nil || m.currentTLE.CatalogID != "234567890" || m.currentTLE.LegacyTLE != nil || m.currentSat == nil {
		t.Fatalf("GP record was not loaded directly: %+v", m.currentTLE)
	}
	m.setScreen(screenDetail)
	m.detailTab = 1
	frame := m.View()
	if !strings.Contains(frame, "234567890") {
		t.Fatal("loaded ID not shown in TUI")
	}
	if !strings.Contains(frame, "GP JSON") {
		t.Fatal("element tab was not labeled GP JSON")
	}
	info, err := orbit.OrbitInfoFromElements(records[0])
	if err != nil {
		t.Fatal(err)
	}
	msg := elementReportCmd(records[0], m.currentSat, info, "google", "json", m.currentMeta)().(reportBuiltMsg)
	if msg.err != nil {
		t.Fatal(msg.err)
	}
	var report map[string]json.RawMessage
	if err := json.Unmarshal([]byte(msg.output), &report); err != nil {
		t.Fatal(err)
	}
	var legacyTLE string
	if err := json.Unmarshal(report["tle"], &legacyTLE); err != nil || legacyTLE != "" {
		t.Fatalf("GP report contains synthesized TLE %q (%v)", legacyTLE, err)
	}
	var source string
	if err := json.Unmarshal(report["source_format"], &source); err != nil || source != "gp-json" {
		t.Fatalf("source_format=%q err=%v", source, err)
	}
	var elementData json.RawMessage
	if err := json.Unmarshal(report["element_data"], &elementData); err != nil || !sameJSON(elementData, records[0].Raw) {
		t.Fatalf("element data not retained: %s (%v)", elementData, err)
	}
}

func sameJSON(a, b []byte) bool {
	var left, right bytes.Buffer
	return json.Compact(&left, a) == nil && json.Compact(&right, b) == nil && bytes.Equal(left.Bytes(), right.Bytes())
}

func TestPassCalculationErrorIsShownInsteadOfNoPasses(t *testing.T) {
	m := testModel(t)
	m.passesErr = errors.New("invalid observer")
	m.active = screenDetail
	m.detailTab = 4
	m.currentSat = &orbit.Propagator{}
	if got := m.detailPassesView(); !strings.Contains(got, "Pass prediction failed: invalid observer") {
		t.Fatalf("view=%q", got)
	}
}
func keyModel(m Model, key tea.KeyMsg) Model { next, _ := m.Update(key); return next.(Model) }
func typeModel(m Model, value string) Model {
	for _, r := range value {
		m = keyModel(m, tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{r}})
	}
	return m
}
func TestFocusedInputsPreserveShortcutCharacters(t *testing.T) {
	for _, screen := range []screen{screenExplore, screenPredict, screenReports, screenSettings} {
		t.Run(screenNames[screen], func(t *testing.T) {
			m := testModel(t)
			m.setScreen(screen)
			var input *textinput.Model
			switch screen {
			case screenExplore:
				m.focus = focusSearch
				input = &m.searchInput
			case screenPredict:
				input = &m.predictInput
			case screenReports:
				m.focus = focusReportPath
				input = &m.reportPath
			case screenSettings:
				m.settingsIndex = 5
				input = &m.settingsInputs[5]
			}
			input.SetValue("")
			m.applyFocus()
			want := "qhrl:asg?/"
			m = typeModel(m, want)
			if m.active != screen || m.commandMode {
				t.Fatal("typing activated navigation or command mode")
			}
			var got string
			switch screen {
			case screenExplore:
				got = m.searchInput.Value()
			case screenPredict:
				got = m.predictInput.Value()
			case screenReports:
				got = m.reportPath.Value()
			case screenSettings:
				got = m.settingsInputs[5].Value()
			}
			if got != want {
				t.Fatalf("input=%q want %q", got, want)
			}
		})
	}
}
func TestSettingsTabSavePreservesHistory(t *testing.T) {
	m := testModel(t)
	m.settings.Recent = []string{"25544", "44744"}
	m.settingsErr = errors.New("invalid old settings")
	m.setScreen(screenSettings)
	for i := 1; i < 6; i++ {
		m = keyModel(m, tea.KeyMsg{Type: tea.KeyTab})
		if m.settingsIndex != i {
			t.Fatalf("tab stuck at %d", m.settingsIndex)
		}
	}
	m.settingsInputs[5].SetValue("osm")
	m = keyModel(m, tea.KeyMsg{Type: tea.KeyCtrlS})
	if m.settingsErr != nil || m.status != "Settings saved" || len(m.settings.Recent) != 2 || m.settings.MapProvider != "osm" {
		t.Fatalf("settings not preserved: %+v / %s", m.settings, m.status)
	}
	saved, err := LoadSettings()
	if err != nil || len(saved.Recent) != 2 {
		t.Fatalf("saved history: %+v %v", saved, err)
	}
}
func TestFailedSettingsSaveLeavesActiveSettings(t *testing.T) {
	m := testModel(t)
	m.setScreen(screenSettings)
	m.settingsInputs[0].SetValue("5")
	path, err := settingsPath()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(path, 0755); err != nil {
		t.Fatal(err)
	}
	m = keyModel(m, tea.KeyMsg{Type: tea.KeyCtrlS})
	if m.settings.RefreshSeconds != 2 || !strings.Contains(m.status, "Save failed") {
		t.Fatalf("failed save changed active settings: %+v %s", m.settings, m.status)
	}
}
func TestSupersededAsyncResultCannotReplaceSelection(t *testing.T) {
	m := testModel(t)
	m, old := m.startRequest(func() tea.Msg { return groupTLEsLoadedMsg{group: "old"} })
	m, current := m.startRequest(func() tea.Msg { return groupTLEsLoadedMsg{group: "new"} })
	next, _ := m.Update(current())
	m = next.(Model)
	next, _ = m.Update(old())
	m = next.(Model)
	if m.selectedGroup != "new" {
		t.Fatalf("stale result replaced current group: %s", m.selectedGroup)
	}
}
func TestSuccessfulRetryClearsError(t *testing.T) {
	m := testModel(t)
	m.err = errors.New("previous request failed")
	m, cmd := m.startRequest(func() tea.Msg { return searchResultsMsg{} })
	next, _ := m.Update(cmd())
	m = next.(Model)
	if m.err != nil || strings.Contains(m.View(), "previous request") {
		t.Fatal("stale error remains after success")
	}
}
func TestTerminalFramesFitAndKeepFooterVisible(t *testing.T) {
	for _, size := range []tea.WindowSizeMsg{{Width: 80, Height: 24}, {Width: 100, Height: 30}, {Width: 140, Height: 40}} {
		m := testModel(t)
		next, _ := m.Update(size)
		m = next.(Model)
		for screen := screenHome; screen <= screenSettings; screen++ {
			m.setScreen(screen)
			m.status = "footer-visible"
			m.warning = "test warning"
			frame := m.View()
			lines := strings.Split(frame, "\n")
			if len(lines) > size.Height {
				t.Fatalf("%s height %d > %d", screenNames[screen], len(lines), size.Height)
			}
			for _, line := range lines {
				if ansi.PrintableRuneWidth(line) > size.Width {
					t.Fatalf("%s exceeds terminal width", screenNames[screen])
				}
			}
			if !strings.Contains(frame, "footer-visible") {
				t.Fatalf("%s footer hidden", screenNames[screen])
			}
		}
	}
}
func TestReportEditingDoesNotGenerateOrSave(t *testing.T) {
	m := testModel(t)
	m.setScreen(screenReports)
	m.focus = focusReportPath
	m.applyFocus()
	path := filepath.Join(t.TempDir(), "r-s-f.txt")
	m.reportOutput = "example"
	m.reportPath.SetValue("")
	m = typeModel(m, path)
	if m.reportSaved != "" || m.loading {
		t.Fatal("editing path triggered report operation")
	}
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatal("typing unexpectedly wrote a file")
	}
}

func TestLocalSearchSupersedesPendingNetworkSearch(t *testing.T) {
	m := testModel(t)
	m, cmd := m.startRequest(func() tea.Msg { return searchResultsMsg{results: []TLESummary{{Name: "obsolete"}}} })
	m.applySearch("cached", "new query")
	next, _ := m.Update(cmd())
	m = next.(Model)
	if len(m.results) != 0 || m.loading {
		t.Fatal("older network search replaced local filter")
	}
}
func TestNavigationDiscardsPendingPassCalculation(t *testing.T) {
	m := testModel(t)
	m.passesLoading = true
	m, cmd := m.startRequest(func() tea.Msg { return passesLoadedMsg{passes: []Pass{{}}} })
	m.setScreen(screenHome)
	next, _ := m.Update(cmd())
	m = next.(Model)
	if m.loading || m.passesLoading || len(m.passes) > 0 {
		t.Fatal("navigation retained superseded operation")
	}
}

func TestEscapeKeepsInputBlurredAcrossBackgroundMessages(t *testing.T) {
	for _, screen := range []screen{screenPredict, screenSettings} {
		m := testModel(t)
		m.setScreen(screen)
		m = keyModel(m, tea.KeyMsg{Type: tea.KeyEsc})
		next, _ := m.Update(struct{}{})
		m = next.(Model)
		if m.focus != focusNone {
			t.Fatalf("%s refocused after Escape", screenNames[screen])
		}
		m = typeModel(m, "q")
		if m.active != screenHome {
			t.Fatalf("%s cannot navigate after Escape", screenNames[screen])
		}
	}
}
