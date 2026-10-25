package tui

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

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
