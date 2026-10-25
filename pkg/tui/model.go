package tui

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

type screen int

const (
	screenHome screen = iota
	screenExplore
	screenDetail
	screenTrack
	screenPredict
	screenReports
	screenSettings
)

var screenNames = []string{
	"Home",
	"Explore",
	"Detail",
	"Track",
	"Predict",
	"Reports",
	"Settings",
}

type focusArea int

const (
	focusNone focusArea = iota
	focusSearch
	focusGroupList
	focusResultList
	focusPredictInput
	focusReportPath
	focusSettings
	focusCommand
)

type Model struct {
	options     Options
	settings    Settings
	settingsErr error
	store       *catalog.Store
	cacheDir    string

	width  int
	height int

	active   screen
	focus    focusArea
	showHelp bool
	status   string
	warning  string

	commandMode  bool
	commandInput textinput.Model

	searchInput  textinput.Model
	predictInput textinput.Model
	reportPath   textinput.Model

	settingsInputs []textinput.Model
	settingsIndex  int
	settingsDirty  bool

	groups        []catalog.Group
	groupList     list.Model
	selectedGroup string

	results    []TLESummary
	resultList list.Model

	groupCache map[string][]elements.Record
	tleCache   map[string]elements.Record

	currentTLE  *elements.Record
	currentMeta catalog.FetchMeta
	currentSat  *orbit.Propagator
	currentPos  Position
	currentOrb  OrbitInfo

	detailTab int

	trackRunning bool
	trackTrail   []Position

	predictResult *PredictResult

	reportFormat string
	reportData   *ReportData
	reportOutput string
	reportSaved  string

	passes        []Pass
	passesLoading bool
	passesErr     error

	requestID    uint64
	scrollOffset int

	loading       bool
	loadingReason string
	err           error
}

func NewModel(opts Options, settings Settings, store *catalog.Store, settingsErr error) Model {
	cacheDir, _ := catalog.DefaultCacheDir()
	groupList := list.New([]list.Item{}, list.NewDefaultDelegate(), 0, 0)
	groupList.Title = "Groups"
	groupList.SetShowHelp(false)
	groupList.SetFilteringEnabled(false)
	groupList.DisableQuitKeybindings()

	resultList := list.New([]list.Item{}, list.NewDefaultDelegate(), 0, 0)
	resultList.Title = "Satellites"
	resultList.SetShowHelp(false)
	resultList.SetFilteringEnabled(false)
	resultList.DisableQuitKeybindings()

	searchInput := textinput.New()
	searchInput.Placeholder = "Search by name or NORAD ID"
	searchInput.Prompt = "/ "
	searchInput.CharLimit = 64
	searchInput.Width = 30

	commandInput := textinput.New()
	commandInput.Placeholder = "norad 25544"
	commandInput.Prompt = ": "
	commandInput.CharLimit = 128
	commandInput.Width = 40

	predictInput := textinput.New()
	predictInput.Placeholder = "2024-02-26T12:00:00Z or +2h"
	predictInput.Prompt = "> "
	predictInput.CharLimit = 64
	predictInput.Width = 40

	reportPath := textinput.New()
	reportPath.Placeholder = "tlego-report-25544.txt"
	reportPath.Prompt = "save to: "
	reportPath.CharLimit = 128
	reportPath.Width = 50

	settingsInputs := buildSettingsInputs(settings)

	model := Model{
		options:        opts,
		settings:       settings,
		settingsErr:    settingsErr,
		store:          store,
		cacheDir:       cacheDir,
		status:         "Ready",
		active:         screenHome,
		focus:          focusNone,
		groupList:      groupList,
		resultList:     resultList,
		searchInput:    searchInput,
		commandInput:   commandInput,
		predictInput:   predictInput,
		reportPath:     reportPath,
		settingsInputs: settingsInputs,
		settingsIndex:  0,
		groupCache:     make(map[string][]elements.Record),
		tleCache:       make(map[string]elements.Record),
		reportFormat:   "text",
		detailTab:      0,
	}

	model.applyOptions()
	return model
}

func (m Model) Init() tea.Cmd {
	cmds := []tea.Cmd{
		fetchGroupsCmd(m.store),
	}
	if m.options.NoradID != "" && m.options.TrackNorad == "" {
		cmds = append(cmds, m.wrapRequest(fetchNoradCmd(m.store, m.options.NoradID)))
	}
	if m.options.TrackNorad != "" {
		cmds = append(cmds, m.wrapRequest(fetchNoradCmd(m.store, m.options.TrackNorad)))
	}
	if m.options.Group != "" && m.options.NoradID == "" && m.options.TrackNorad == "" {
		cmds = append(cmds, m.wrapRequest(fetchGroupTLEsCmd(m.store, m.options.Group)))
	}
	return tea.Batch(cmds...)
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	if result, ok := msg.(requestResultMsg); ok {
		if result.id != m.requestID {
			return m, nil
		}
		msg = result.msg
		m.err = nil
	}
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		listWidth := maxInt(20, m.width)
		if m.width >= 100 {
			listWidth = (m.width - 4) / 2
		}
		listHeight := maxInt(5, m.height-13)
		m.groupList.SetSize(listWidth, listHeight)
		m.resultList.SetSize(listWidth, listHeight)
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			return m, tea.Quit
		}
		if m.commandMode {
			return m.updateCommandInput(msg)
		}
		if m.editingInput() && msg.String() != "esc" {
			if m.active == screenSettings || (msg.String() != "tab" && msg.String() != "shift+tab") {
				return m.updateActiveView(msg)
			}
		}
		if cmd, handled := m.handleGlobalKeys(msg); handled {
			return m, cmd
		}
	}

	switch msg := msg.(type) {
	case groupsLoadedMsg:
		if msg.err != nil {
			m.status = "Failed to load groups"
			m.warning = msg.err.Error()
			break
		}
		m.groups = msg.groups
		m.groupList.SetItems(groupsToItems(msg.groups))
	case groupTLEsLoadedMsg:
		m.loading = false
		if msg.err != nil {
			m.status = fmt.Sprintf("Failed to load group %s", msg.group)
			m.err = msg.err
			break
		}
		m.currentMeta = msg.meta
		m.warning = msg.meta.Warning
		m.groupCache[msg.group] = msg.records
		m.selectedGroup = msg.group
		m.results = buildElementSummaries(msg.records)
		m.resultList.SetItems(tleSummariesToItems(m.results))
		for _, item := range msg.records {
			m.tleCache[item.CatalogID] = item
		}
		if msg.query != "" {
			m.applySearch(msg.group, msg.query)
		}
	case noradLoadedMsg:
		m.loading = false
		if msg.err != nil {
			m.status = fmt.Sprintf("Failed to load NORAD %s", msg.noradID)
			m.err = msg.err
			break
		}
		m.warning = msg.meta.Warning
		m.currentMeta = msg.meta
		m.setCurrentElement(msg.record)
	case searchResultsMsg:
		m.loading = false
		if msg.err != nil {
			m.status = "Search failed"
			m.err = msg.err
			break
		}
		for _, item := range msg.records {
			m.tleCache[item.CatalogID] = item
		}
		m.results = msg.results
		m.resultList.SetItems(tleSummariesToItems(m.results))
		m.status = fmt.Sprintf("Found %d matches", len(msg.results))
		m.warning = msg.warning
	case trackTickMsg:
		if m.trackRunning && m.currentSat != nil {
			m.updateTrackPosition(time.Time(msg))
			return m, trackTickCmd(m.settings.RefreshInterval())
		}
	case predictDoneMsg:
		m.loading = false
		if msg.err != nil {
			m.status = "Prediction failed"
			m.err = msg.err
			break
		}
		m.predictResult = &msg.result
		m.status = "Prediction ready"
	case passesLoadedMsg:
		m.passesLoading = false
		m.passesErr = msg.err
		if msg.err != nil {
			m.status = "Pass prediction failed"
			m.err = msg.err
			break
		}
		m.passes = msg.passes
	case reportBuiltMsg:
		m.loading = false
		if msg.err != nil {
			m.status = "Report failed"
			m.err = msg.err
			break
		}
		m.reportData = &msg.report
		m.reportOutput = msg.output
		m.status = "Report ready"
	}

	return m.updateActiveView(msg)
}

func (m Model) updateActiveView(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch m.active {
	case screenHome:
		m, cmd = m.updateHome(msg)
	case screenExplore:
		m, cmd = m.updateExplore(msg)
	case screenPredict:
		m, cmd = m.updatePredict(msg)
	case screenReports:
		m, cmd = m.updateReports(msg)
	case screenSettings:
		m, cmd = m.updateSettings(msg)
	case screenDetail:
		m, cmd = m.updateDetail(msg)
	case screenTrack:
		m, cmd = m.updateTrack(msg)
	}
	return m, cmd
}

func (m *Model) handleGlobalKeys(msg tea.KeyMsg) (tea.Cmd, bool) {
	switch msg.String() {
	case "?":
		m.showHelp = !m.showHelp
		return nil, true
	case ":":
		m.commandMode = true
		m.commandInput.SetValue("")
		m.commandInput.Focus()
		m.focus = focusCommand
		return nil, true
	case "q":
		if m.active == screenHome {
			m.status = "Exiting"
			return tea.Quit, true
		}
		m.setScreen(screenHome)
		m.focus = focusNone
		return nil, true
	case "esc":
		if m.focus != focusNone {
			m.blurInputs()
			return nil, true
		}
		if m.active != screenHome {
			m.setScreen(screenHome)
			return nil, true
		}
	case "left", "h":
		m.setScreen(previousScreen(m.active))
		return nil, true
	case "right", "l":
		m.setScreen(nextScreen(m.active))
		return nil, true
	case "pgup":
		m.scrollOffset = maxInt(0, m.scrollOffset-maxInt(1, m.height-10))
		return nil, true
	case "pgdown":
		m.scrollOffset += maxInt(1, m.height-10)
		return nil, true
	case "r":
		if m.active == screenReports {
			return nil, false
		}
		cmd := m.refreshCurrentView()
		return cmd, cmd != nil
	case "tab":
		return nil, m.cycleFocus()
	case "shift+tab":
		return nil, m.cycleFocusReverse()
	}
	return nil, false
}

func (m *Model) applyOptions() {
	if m.options.TrackNorad != "" {
		m.setScreen(screenTrack)
		return
	}
	if m.options.NoradID != "" {
		m.setScreen(screenDetail)
		return
	}
	if m.options.Group != "" {
		m.setScreen(screenExplore)
		m.selectedGroup = m.options.Group
		return
	}
	if m.options.Screen != "" {
		if idx := screenFromName(m.options.Screen); idx >= 0 {
			m.setScreen(idx)
		}
	}
}

func screenFromName(name string) screen {
	for i, screenName := range screenNames {
		if strings.EqualFold(screenName, name) {
			return screen(i)
		}
	}
	return screenHome
}

func nextScreen(current screen) screen {
	return screen((int(current) + 1) % len(screenNames))
}

func previousScreen(current screen) screen {
	return screen((int(current) - 1 + len(screenNames)) % len(screenNames))
}

func (m *Model) setCurrentElement(record elements.Record) {
	m.requestID++
	m.loading = false
	m.predictResult = nil
	m.passes = nil
	m.passesLoading = false
	m.passesErr = nil
	m.trackTrail = nil
	m.reportData = nil
	m.reportOutput = ""
	m.reportSaved = ""
	m.err = nil
	m.currentTLE = nil
	m.currentSat = nil
	m.currentPos = Position{}
	m.currentOrb = OrbitInfo{}
	propagator, err := orbit.New(record)
	if err != nil {
		m.err = err
		m.status = fmt.Sprintf("Failed to initialize %s (%s)", record.Name, record.CatalogID)
		return
	}
	state, err := propagator.At(time.Now())
	if err != nil {
		m.err = err
		m.status = "Propagation failed"
		return
	}
	info, err := orbit.OrbitInfoFromElements(record)
	if err != nil {
		m.err = err
		m.status = "Invalid orbital elements"
		return
	}
	m.currentTLE = &record
	m.currentSat = propagator
	m.currentPos = positionFromState(state)
	m.currentOrb = info
	m.tleCache[record.CatalogID] = record
	m.appendRecent(record.CatalogID)
	m.status = fmt.Sprintf("Loaded %s (%s)", record.Name, record.CatalogID)
}

func (m *Model) appendRecent(noradID string) {
	if noradID == "" {
		return
	}
	updated := []string{noradID}
	for _, item := range m.settings.Recent {
		if item == noradID {
			continue
		}
		updated = append(updated, item)
		if len(updated) >= 5 {
			break
		}
	}
	m.settings.Recent = updated
	if err := SaveSettings(m.settings); err != nil {
		m.warning = fmt.Sprintf("failed to save recent list: %v", err)
	}
}

func (m *Model) updateTrackPosition(now time.Time) {
	if m.currentSat == nil {
		return
	}
	state, err := m.currentSat.At(now)
	if err != nil {
		m.err = err
		m.status = "Propagation failed"
		return
	}
	m.currentPos = positionFromState(state)
	m.trackTrail = append(m.trackTrail, m.currentPos)
	if len(m.trackTrail) > 40 {
		m.trackTrail = m.trackTrail[len(m.trackTrail)-40:]
	}
}

func (m *Model) blurInputs() {
	m.searchInput.Blur()
	m.predictInput.Blur()
	m.reportPath.Blur()
	m.commandInput.Blur()
	for i := range m.settingsInputs {
		m.settingsInputs[i].Blur()
	}
	m.focus = focusNone
}

func (m *Model) refreshCurrentView() tea.Cmd {
	switch m.active {
	case screenExplore:
		if m.selectedGroup != "" {
			m.loading = true
			m.loadingReason = "Refreshing group"
			m.status = "Refreshing group data"
			m.beginRequest()
			return m.wrapRequest(fetchGroupTLEsCmd(m.store, m.selectedGroup))
		}
	case screenDetail, screenTrack, screenPredict, screenReports:
		if m.currentTLE != nil {
			m.loading = true
			m.loadingReason = "Refreshing NORAD"
			m.status = "Refreshing satellite data"
			m.beginRequest()
			return m.wrapRequest(fetchNoradCmd(m.store, m.currentTLE.CatalogID))
		}
	}
	return nil
}

func (m *Model) cycleFocus() bool {
	switch m.active {
	case screenExplore:
		switch m.focus {
		case focusSearch:
			m.focus = focusGroupList
		case focusGroupList:
			m.focus = focusResultList
		default:
			m.focus = focusSearch
		}
		m.applyFocus()
		return true
	case screenPredict:
		m.focus = focusPredictInput
		m.applyFocus()
		return true
	case screenReports:
		m.focus = focusReportPath
		m.applyFocus()
		return true
	case screenSettings:
		m.focus = focusSettings
		m.applyFocus()
		return true
	}
	return false
}

func (m *Model) cycleFocusReverse() bool {
	switch m.active {
	case screenExplore:
		switch m.focus {
		case focusResultList:
			m.focus = focusGroupList
		case focusGroupList:
			m.focus = focusSearch
		default:
			m.focus = focusResultList
		}
		m.applyFocus()
		return true
	case screenSettings:
		m.focus = focusSettings
		m.applyFocus()
		return true
	}
	return false
}

func (m *Model) applyFocus() {
	m.searchInput.Blur()
	m.predictInput.Blur()
	m.reportPath.Blur()
	for i := range m.settingsInputs {
		m.settingsInputs[i].Blur()
	}
	switch m.focus {
	case focusSearch:
		m.searchInput.Focus()
	case focusPredictInput:
		m.predictInput.Focus()
	case focusReportPath:
		m.reportPath.Focus()
	case focusSettings:
		if len(m.settingsInputs) > 0 {
			m.settingsInputs[m.settingsIndex].Focus()
		}
	}
}

func (m Model) updateCommandInput(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	m.commandInput, cmd = m.commandInput.Update(msg)
	switch msg.String() {
	case "esc":
		m.commandMode = false
		m.commandInput.Blur()
		m.focus = focusNone
		return m, nil
	case "enter":
		command := strings.TrimSpace(m.commandInput.Value())
		m.commandMode = false
		m.commandInput.Blur()
		m.focus = focusNone
		return m.handleCommand(command)
	}
	return m, cmd
}

func (m Model) handleCommand(command string) (tea.Model, tea.Cmd) {
	if command == "" {
		return m, nil
	}
	parts := strings.Fields(command)
	switch strings.ToLower(parts[0]) {
	case "quit", "exit":
		return m, tea.Quit
	case "help":
		m.showHelp = true
		return m, nil
	case "screen":
		if len(parts) > 1 {
			m.setScreen(screenFromName(parts[1]))
		}
		return m, nil
	case "norad":
		if len(parts) < 2 {
			m.status = "usage: :norad <id>"
			return m, nil
		}
		m.setScreen(screenDetail)
		m.loading = true
		return m.startRequest(fetchNoradCmd(m.store, parts[1]))
	case "track":
		if len(parts) < 2 {
			m.status = "usage: :track <id>"
			return m, nil
		}
		m.setScreen(screenTrack)
		m.loading = true
		return m.startRequest(fetchNoradCmd(m.store, parts[1]))
	case "group":
		if len(parts) < 2 {
			m.status = "usage: :group <name>"
			return m, nil
		}
		group := strings.Join(parts[1:], " ")
		m.setScreen(screenExplore)
		m.selectedGroup = group
		m.loading = true
		return m.startRequest(fetchGroupTLEsCmd(m.store, group))
	case "search":
		query := strings.Join(parts[1:], " ")
		if query == "" {
			m.status = "usage: :search <query>"
			return m, nil
		}
		m.setScreen(screenExplore)
		m.searchInput.SetValue(query)
		m.loading = true
		return m.startRequest(searchAllGroupsCmd(m.store, query))
	}
	m.status = "Unknown command"
	return m, nil
}

func (m Model) updateExplore(msg tea.Msg) (Model, tea.Cmd) {
	var cmd tea.Cmd
	if m.focus == focusSearch {
		if key, ok := msg.(tea.KeyMsg); !ok || key.String() != "enter" {
			m.searchInput, cmd = m.searchInput.Update(msg)
			return m, cmd
		}
	}
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "/":
			m.focus = focusSearch
			m.applyFocus()
			return m, nil
		case "g":
			m.focus = focusGroupList
			m.applyFocus()
			return m, nil
		case "a":
			query := strings.TrimSpace(m.searchInput.Value())
			if query == "" {
				m.status = "Enter a search query first"
				return m, nil
			}
			m.loading = true
			m.loadingReason = "Searching all groups"
			m.status = "Searching all groups"
			return m.startRequest(searchAllGroupsCmd(m.store, query))
		case "enter":
			switch m.focus {
			case focusSearch:
				query := strings.TrimSpace(m.searchInput.Value())
				if query == "" {
					m.status = "Enter a search query"
					return m, nil
				}
				if m.selectedGroup == "" {
					m.loading = true
					m.status = "Searching all groups"
					return m.startRequest(searchAllGroupsCmd(m.store, query))
				}
				if _, ok := m.groupCache[m.selectedGroup]; ok {
					m.applySearch(m.selectedGroup, query)
					return m, nil
				}
				m.loading = true
				m.status = fmt.Sprintf("Loading %s", m.selectedGroup)
				return m.startRequest(fetchGroupSearchCmd(m.store, m.selectedGroup, query))
			case focusGroupList:
				item, ok := m.groupList.SelectedItem().(groupItem)
				if !ok {
					return m, nil
				}
				m.selectedGroup = item.group.Name
				m.loading = true
				m.status = fmt.Sprintf("Loading %s", m.selectedGroup)
				return m.startRequest(fetchGroupTLEsCmd(m.store, m.selectedGroup))
			case focusResultList:
				item, ok := m.resultList.SelectedItem().(tleItem)
				if !ok {
					return m, nil
				}
				if cached, ok := m.tleCache[item.summary.NoradID]; ok {
					m.setCurrentElement(cached)
					m.setScreen(screenDetail)
					return m, nil
				}
				m.setScreen(screenDetail)
				m.loading = true
				return m.startRequest(fetchNoradCmd(m.store, item.summary.NoradID))
			}
		}
	}

	if m.focus == focusSearch {
		m.searchInput, cmd = m.searchInput.Update(msg)
		return m, cmd
	}
	if m.focus == focusGroupList {
		m.groupList, cmd = m.groupList.Update(msg)
		return m, cmd
	}
	if m.focus == focusResultList {
		m.resultList, cmd = m.resultList.Update(msg)
		return m, cmd
	}
	return m, nil
}

func (m Model) updateHome(msg tea.Msg) (Model, tea.Cmd) {
	if key, ok := msg.(tea.KeyMsg); ok {
		switch key.String() {
		case "1", "2", "3", "4", "5":
			index := int(key.String()[0] - '1')
			if index >= 0 && index < len(m.settings.Recent) {
				noradID := m.settings.Recent[index]
				m.setScreen(screenDetail)
				m.loading = true
				return m.startRequest(fetchNoradCmd(m.store, noradID))
			}
		}
	}
	return m, nil
}

func (m Model) updateDetail(msg tea.Msg) (Model, tea.Cmd) {
	if key, ok := msg.(tea.KeyMsg); ok {
		switch key.String() {
		case "1", "2", "3", "4", "5":
			idx := int(key.String()[0] - '1')
			if idx >= 0 && idx < 5 {
				m.detailTab = idx
			}
		case "[":
			if m.detailTab > 0 {
				m.detailTab--
			}
		case "]":
			if m.detailTab < 4 {
				m.detailTab++
			}
		case "p":
			if m.detailTab == 4 && m.currentSat != nil {
				m.passesLoading = true
				m.passesErr = nil
				m.status = "Calculating passes"
				return m.startRequest(passesCmd(m.currentSat, m.settings.Observer, time.Now(), 24*time.Hour, time.Minute))
			}
		case "t":
			if m.currentTLE != nil {
				m.setScreen(screenTrack)
			}
		}
	}
	return m, nil
}

func (m Model) updateTrack(msg tea.Msg) (Model, tea.Cmd) {
	if key, ok := msg.(tea.KeyMsg); ok {
		switch key.String() {
		case " ":
			if m.currentSat == nil {
				m.status = "Load a satellite first"
				return m, nil
			}
			m.trackRunning = !m.trackRunning
			if m.trackRunning {
				m.status = "Tracking started"
				m.updateTrackPosition(time.Now())
				return m, trackTickCmd(m.settings.RefreshInterval())
			}
			m.status = "Tracking stopped"
		case "s":
			if m.currentSat == nil {
				return m, nil
			}
			m.status = fmt.Sprintf("Snapshot: %.4f, %.4f", m.currentPos.LatDeg, m.currentPos.LonDeg)
		}
	}
	return m, nil
}

func (m Model) updatePredict(msg tea.Msg) (Model, tea.Cmd) {
	var cmd tea.Cmd
	m.predictInput, cmd = m.predictInput.Update(msg)
	if key, ok := msg.(tea.KeyMsg); ok {
		switch key.String() {
		case "enter":
			if m.currentSat == nil {
				m.status = "Load a satellite first"
				return m, nil
			}
			query := strings.TrimSpace(m.predictInput.Value())
			if query == "" {
				m.status = "Enter a time value"
				return m, nil
			}
			parsed, err := parseTimeInput(query, time.Now())
			if err != nil {
				m.status = err.Error()
				return m, nil
			}
			m.loading = true
			m.status = "Predicting position"
			return m.startRequest(predictCmd(m.currentSat, parsed, m.settings.MapProvider))
		}
	}
	return m, cmd
}

func (m Model) updateReports(msg tea.Msg) (Model, tea.Cmd) {
	var cmd tea.Cmd
	if m.focus == focusReportPath {
		if key, ok := msg.(tea.KeyMsg); ok && key.String() == "enter" {
			m.blurInputs()
			return m, nil
		}
		m.reportPath, cmd = m.reportPath.Update(msg)
		return m, cmd
	}
	if key, ok := msg.(tea.KeyMsg); ok {
		switch key.String() {
		case "f":
			m.requestID++
			m.loading = false
			m.reportOutput = ""
			m.reportData = nil
			m.reportFormat = nextReportFormat(m.reportFormat)
			m.status = fmt.Sprintf("Format: %s", m.reportFormat)
		case "r", "enter":
			if m.currentTLE == nil || m.currentSat == nil {
				m.status = "Load a satellite first"
				return m, nil
			}
			m.loading = true
			m.status = "Generating report"
			return m.startRequest(elementReportCmd(*m.currentTLE, m.currentSat, m.currentOrb, m.settings.MapProvider, m.reportFormat, m.currentMeta))
		case "s":
			if m.reportOutput == "" {
				m.status = "Generate a report first"
				return m, nil
			}
			path := strings.TrimSpace(m.reportPath.Value())
			if path == "" && m.currentTLE != nil {
				path = defaultReportPath(m.currentTLE.CatalogID, m.reportFormat)
			}
			if path == "" {
				m.status = "Provide a save path"
				return m, nil
			}
			if err := writeReport(path, m.reportOutput); err != nil {
				m.status = fmt.Sprintf("Save failed: %v", err)
				return m, nil
			}
			m.reportSaved = path
			m.status = "Report saved"
		}
	}
	return m, cmd
}

func (m Model) updateSettings(msg tea.Msg) (Model, tea.Cmd) {
	var cmd tea.Cmd
	if len(m.settingsInputs) == 0 {
		return m, nil
	}
	if key, ok := msg.(tea.KeyMsg); ok {
		switch key.String() {
		case "down", "tab":
			m.settingsInputs[m.settingsIndex].Blur()
			m.settingsIndex = (m.settingsIndex + 1) % len(m.settingsInputs)
			m.settingsInputs[m.settingsIndex].Focus()
		case "up", "shift+tab":
			m.settingsInputs[m.settingsIndex].Blur()
			m.settingsIndex = (m.settingsIndex - 1 + len(m.settingsInputs)) % len(m.settingsInputs)
			m.settingsInputs[m.settingsIndex].Focus()
		case "ctrl+s":
			settings, err := parseSettingsInputs(m.settingsInputs, m.settings)
			if err != nil {
				m.status = fmt.Sprintf("Settings error: %v", err)
				return m, nil
			}
			if err := SaveSettings(settings); err != nil {
				m.status = fmt.Sprintf("Save failed: %v", err)
				return m, nil
			}
			m.settings = settings
			m.settingsErr = nil
			m.store = catalog.NewStore(m.cacheDir, settings.CacheTTL())
			m.status = "Settings saved"
			return m, nil
		default:
			m.settingsInputs[m.settingsIndex], cmd = m.settingsInputs[m.settingsIndex].Update(msg)
		}
	}
	return m, cmd
}

func (m *Model) applySearch(group, query string) {
	m.requestID++
	m.loading = false
	m.passesLoading = false
	m.err = nil
	query = strings.ToLower(strings.TrimSpace(query))
	if query == "" {
		return
	}
	source := m.groupCache[group]
	var summaries []TLESummary
	for _, item := range source {
		if strings.Contains(strings.ToLower(item.Name), query) || strings.Contains(item.CatalogID, query) {
			summaries = append(summaries, summaryFromElement(item))
		}
	}
	m.results = summaries
	m.resultList.SetItems(tleSummariesToItems(summaries))
	m.status = fmt.Sprintf("Found %d matches", len(summaries))
}

func summaryFromElement(record elements.Record) TLESummary {
	age := time.Duration(0)
	if epoch, err := record.Time(); err == nil {
		age = time.Since(epoch)
	}
	orbitClass := ""
	if info, err := orbit.OrbitInfoFromElements(record); err == nil {
		orbitClass = info.OrbitClass
	}
	return TLESummary{Name: record.Name, NoradID: record.CatalogID, Age: age, OrbitClass: orbitClass}
}

func buildElementSummaries(records []elements.Record) []TLESummary {
	summaries := make([]TLESummary, 0, len(records))
	for _, record := range records {
		summaries = append(summaries, summaryFromElement(record))
	}
	return summaries
}

func defaultReportPath(noradID, format string) string {
	if noradID == "" {
		return ""
	}
	switch format {
	case "json", "json-v1":
		return fmt.Sprintf("tlego-report-%s.json", noradID)
	case "csv":
		return fmt.Sprintf("tlego-report-%s.csv", noradID)
	default:
		return fmt.Sprintf("tlego-report-%s.txt", noradID)
	}
}

func nextReportFormat(current string) string {
	switch current {
	case "text":
		return "json"
	case "json":
		return "csv"
	case "csv":
		return "json-v1"
	default:
		return "text"
	}
}

func writeReport(path, output string) error {
	return writeFile(path, []byte(output))
}

func writeFile(path string, data []byte) error {
	return os.WriteFile(path, data, 0o644)
}

func buildSettingsInputs(settings Settings) []textinput.Model {
	fields := []string{
		strconv.Itoa(settings.RefreshSeconds),
		strconv.Itoa(settings.CacheTTLSeconds),
		fmt.Sprintf("%.6f", settings.Observer.Lat),
		fmt.Sprintf("%.6f", settings.Observer.Lon),
		fmt.Sprintf("%.2f", settings.Observer.Alt),
		settings.MapProvider,
	}
	inputs := make([]textinput.Model, 0, len(fields))
	for _, value := range fields {
		input := textinput.New()
		input.CharLimit = 64
		input.Width = 24
		input.SetValue(value)
		inputs = append(inputs, input)
	}
	if len(inputs) > 0 {
		inputs[0].Focus()
	}
	return inputs
}

func parseSettingsInputs(inputs []textinput.Model, settings Settings) (Settings, error) {
	if len(inputs) < 6 {
		return Settings{}, fmt.Errorf("settings inputs missing")
	}
	refresh, err := strconv.Atoi(strings.TrimSpace(inputs[0].Value()))
	if err != nil {
		return Settings{}, fmt.Errorf("refresh seconds must be a number")
	}
	ttl, err := strconv.Atoi(strings.TrimSpace(inputs[1].Value()))
	if err != nil {
		return Settings{}, fmt.Errorf("cache TTL must be a number")
	}
	lat, err := strconv.ParseFloat(strings.TrimSpace(inputs[2].Value()), 64)
	if err != nil {
		return Settings{}, fmt.Errorf("observer latitude must be a number")
	}
	lon, err := strconv.ParseFloat(strings.TrimSpace(inputs[3].Value()), 64)
	if err != nil {
		return Settings{}, fmt.Errorf("observer longitude must be a number")
	}
	alt, err := strconv.ParseFloat(strings.TrimSpace(inputs[4].Value()), 64)
	if err != nil {
		return Settings{}, fmt.Errorf("observer altitude must be a number")
	}
	mapProvider := strings.TrimSpace(inputs[5].Value())
	settings.RefreshSeconds = refresh
	settings.CacheTTLSeconds = ttl
	settings.Observer.Lat = lat
	settings.Observer.Lon = lon
	settings.Observer.Alt = alt
	if mapProvider != "" {
		settings.MapProvider = mapProvider
	}
	return settings, settings.Validate()
}

// requestResultMsg prevents an older asynchronous operation replacing newer state.
type requestResultMsg struct {
	id  uint64
	msg tea.Msg
}

func (m *Model) beginRequest() { m.requestID++; m.err = nil; m.warning = ""; m.loading = true }
func (m Model) wrapRequest(cmd tea.Cmd) tea.Cmd {
	id := m.requestID
	return func() tea.Msg { return requestResultMsg{id: id, msg: cmd()} }
}
func (m Model) startRequest(cmd tea.Cmd) (Model, tea.Cmd) {
	m.beginRequest()
	return m, m.wrapRequest(cmd)
}
func (m Model) editingInput() bool {
	switch m.focus {
	case focusSearch, focusPredictInput, focusReportPath, focusSettings:
		return true
	}
	return false
}
func (m *Model) setScreen(next screen) {
	m.requestID++
	m.loading = false
	m.passesLoading = false
	if next != screenTrack {
		m.trackRunning = false
	}
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
