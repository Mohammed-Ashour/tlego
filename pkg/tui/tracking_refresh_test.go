package tui

import (
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

func TestTrackingReloadStartsOneNewSession(t *testing.T) {
	for _, state := range []string{"running", "paused", "changed satellite", "invalid elements"} {
		t.Run(state, func(t *testing.T) {
			m := testModel(t)
			m.setCurrentElement(regressionRecord(t))
			m.setScreen(screenTrack)
			m = keyModel(m, tea.KeyMsg{Type: tea.KeySpace})
			if state == "paused" {
				m = keyModel(m, tea.KeyMsg{Type: tea.KeySpace})
			}
			oldSession := m.trackSession
			entry := *m.currentEntry
			if state == "changed satellite" {
				entry.Record.CatalogID = "12345"
			}
			if state == "invalid elements" {
				entry.Record.MeanMotionRevDay = 0
			}
			m = keyModel(m, tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'r'}})
			next, cmd := m.Update(requestResultMsg{id: m.requestID, msg: noradLoadedMsg{record: entry.Record, meta: entry.Meta}})
			m = next.(Model)
			wantRunning := state == "running"
			if m.trackRunning != wantRunning || (cmd != nil) != wantRunning {
				t.Fatalf("running=%v timer=%v, want %v", m.trackRunning, cmd != nil, wantRunning)
			}
			if wantRunning && m.trackSession == oldSession {
				t.Fatal("reload reused the previous tracking session")
			}
			before := len(m.trackTrail)
			next, oldCmd := m.Update(trackTickMsg{at: time.Now(), session: oldSession})
			m = next.(Model)
			if oldCmd != nil || len(m.trackTrail) != before {
				t.Fatal("old tracking tick was accepted")
			}
			if wantRunning {
				next, currentCmd := m.Update(trackTickMsg{at: time.Now(), session: m.trackSession})
				m = next.(Model)
				if currentCmd == nil || len(m.trackTrail) != before+1 {
					t.Fatal("current tracking session did not continue")
				}
			}
		})
	}
}
