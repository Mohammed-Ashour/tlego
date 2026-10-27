package tui

import (
	"context"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

type requestState struct {
	parent context.Context
	cancel context.CancelFunc
}

type passResult struct {
	input  passInput
	passes []Pass
}

type passInput struct {
	element        string
	version        uint64
	observer       Observer
	start          time.Time
	duration, step time.Duration
}

func (m *Model) cancelRequest() {
	if m.request != nil && m.request.cancel != nil {
		m.request.cancel()
		m.request.cancel = nil
	}
}
func (m *Model) newRequestContext() context.Context {
	ctx, cancel := context.WithCancel(m.request.parent)
	m.request.cancel = cancel
	return ctx
}
func (m *Model) initialContext() context.Context {
	m.cancelRequest()
	return m.newRequestContext()
}
func (m Model) startContextRequest(makeCmd func(context.Context) tea.Cmd) (Model, tea.Cmd) {
	m.beginRequest()
	return m, m.wrapRequest(makeCmd(m.newRequestContext()))
}

// requestResultMsg prevents an older asynchronous operation replacing newer state.
type requestResultMsg struct {
	id  uint64
	msg tea.Msg
}

func (m *Model) beginRequest() {
	m.cancelRequest()
	m.requestID++
	m.err = nil
	m.warning = ""
	m.loading = true
}
func (m Model) wrapRequest(cmd tea.Cmd) tea.Cmd {
	id := m.requestID
	return func() tea.Msg { return requestResultMsg{id: id, msg: cmd()} }
}
func (m Model) startRequest(cmd tea.Cmd) (Model, tea.Cmd) {
	m.beginRequest()
	return m, m.wrapRequest(cmd)
}

func (m *Model) setScreen(next screen) {
	m.cancelRequest()
	m.requestID++
	m.trackSession++
	m.loading = false
	m.passesLoading = false
	m.trackRunning = false
	m.blurInputs()
	m.active = next
	m.scrollOffset = 0
	if next == screenPredict {
		m.focus = focusPredictInput
	}
	if next == screenSettings {
		m.focus = focusSettings
	}
	m.applyFocus()
}
