package tui

import (
	"fmt"
	"strings"
	"time"

	"github.com/muesli/reflow/truncate"
)

func (m Model) View() string {
	width, height := m.width, m.height
	if width <= 0 {
		width = 80
	}
	if height <= 0 {
		height = 24
	}
	header := fmt.Sprintf("tlego tui | %s", screenNames[m.active])
	if m.currentMeta.Age > 0 {
		header += " | data age " + FormatAge(m.currentMeta.Age)
	}
	if m.currentMeta.FromCache {
		header += " | cache"
	}
	if m.currentMeta.Stale {
		header += " | stale"
	}
	content := ""
	switch m.active {
	case screenHome:
		content = m.homeView()
	case screenExplore:
		content = m.exploreView()
	case screenDetail:
		content = m.detailView()
	case screenTrack:
		content = m.trackView()
	case screenPredict:
		content = m.predictView()
	case screenReports:
		content = m.reportView()
	case screenSettings:
		content = m.settingsView()
	}
	if m.showHelp {
		content = helpView()
	}
	status := m.status
	if m.err != nil {
		status = "error: " + m.err.Error()
	}
	if m.loading || m.passesLoading {
		status = "Working... " + status
	}
	footer := []string{status}
	if m.warning != "" {
		footer = append(footer, "warning: "+m.warning)
	}
	if m.settingsErr != nil {
		footer = append(footer, "settings: "+m.settingsErr.Error())
	}
	if m.commandMode {
		footer = append(footer, m.commandInput.View())
	}
	lines := []string{header, strings.Repeat("=", minInt(width, 100)), m.navLine(), ""}
	body := strings.Split(strings.TrimRight(content, "\n"), "\n")
	space := maxInt(1, height-len(lines)-len(footer)-1)
	offset := minInt(m.scrollOffset, maxInt(0, len(body)-space))
	lines = append(lines, body[offset:minInt(offset+space, len(body))]...)
	lines = append(lines, "")
	lines = append(lines, footer...)
	if len(lines) > height {
		lines = lines[:height]
	}
	for i := range lines {
		lines[i] = truncate.String(lines[i], uint(width))
	}
	return strings.Join(lines, "\n")
}

func (m Model) navLine() string {
	parts := make([]string, 0, len(screenNames))
	for i, name := range screenNames {
		if screen(i) == m.active {
			parts = append(parts, "["+name+"]")
			continue
		}
		parts = append(parts, name)
	}
	return strings.Join(parts, " | ")
}

func (m Model) homeView() string {
	var b strings.Builder
	b.WriteString("Quick actions:\n")
	b.WriteString("- / search\n")
	b.WriteString("- :norad <id>\n")
	b.WriteString("- :group <name>\n")
	b.WriteString("- :track <id>\n")
	b.WriteString("- ? help\n")
	b.WriteString("\nRecent satellites:\n")
	if len(m.settings.Recent) == 0 {
		b.WriteString("  (none yet)\n")
	} else {
		for i, id := range m.settings.Recent {
			b.WriteString(fmt.Sprintf("  %d) %s\n", i+1, id))
		}
	}
	return b.String()
}

func (m Model) exploreView() string {
	var b strings.Builder
	b.WriteString("Search: " + m.searchInput.View() + "\n")
	if m.selectedGroup != "" {
		b.WriteString(fmt.Sprintf("Group: %s\n", m.selectedGroup))
	} else {
		b.WriteString("Group: (none)\n")
	}
	b.WriteString("Focus: / search, tab cycle, g groups, enter select\n\n")
	groupView := m.groupList.View()
	resultView := m.resultList.View()

	if m.width >= 100 {
		b.WriteString(joinColumns(groupView, resultView, 4))
		return b.String()
	}
	if m.focus == focusGroupList || (m.focus != focusResultList && len(m.results) == 0) {
		b.WriteString(groupView)
	} else {
		b.WriteString(resultView)
	}
	return b.String()
}

func (m Model) detailView() string {
	if m.currentTLE == nil {
		return "No satellite loaded. Use Explore or :norad <id>."
	}
	elementLabel := "TLE"
	if m.currentTLE.SourceFormat == "gp-json" {
		elementLabel = "GP JSON"
	}
	tabs := []string{"Summary", elementLabel, "Orbit", "Ground Track", "Passes"}
	tabLine := tabLine(tabs, m.detailTab)
	var b strings.Builder
	b.WriteString(tabLine + "\n")
	b.WriteString("Tabs: 1-5 or [ ] to switch\n\n")

	switch m.detailTab {
	case 0:
		b.WriteString(m.detailSummaryView())
	case 1:
		if m.currentTLE.SourceFormat == "gp-json" {
			b.WriteString("GP JSON element data\n\n")
		}
		b.WriteString(m.currentTLE.String())
	case 2:
		b.WriteString(m.detailOrbitView())
	case 3:
		b.WriteString(m.detailGroundTrackView())
	case 4:
		b.WriteString(m.detailPassesView())
	}
	return b.String()
}

func (m Model) detailSummaryView() string {
	if m.currentTLE == nil {
		return ""
	}
	epoch, _ := m.currentTLE.Time()
	age := "unknown"
	epochStr := "unknown"
	if !epoch.IsZero() {
		age = FormatAge(time.Since(epoch))
		epochStr = epoch.Format(time.RFC3339)
	}
	mapURL := MapURL(m.settings.MapProvider, m.currentPos.LatDeg, m.currentPos.LonDeg)
	return fmt.Sprintf(
		"Name: %s\nNORAD ID: %s\nEpoch: %s (age %s)\n\nPosition:\n  Time: %s\n  Lat: %.6f°\n  Lon: %.6f°\n  Alt: %.2f km\n  Velocity: %.3f km/s\n\nOrbit class: %s\nMap: %s\n",
		m.currentTLE.Name,
		m.currentTLE.CatalogID,
		epochStr,
		age,
		m.currentPos.Time.Format(time.RFC3339),
		m.currentPos.LatDeg,
		m.currentPos.LonDeg,
		m.currentPos.AltKm,
		m.currentPos.VelocityKm,
		m.currentOrb.OrbitClass,
		mapURL,
	)
}

func (m Model) detailOrbitView() string {
	return fmt.Sprintf(
		"Inclination: %.4f°\nEccentricity: %.6f\nMean Motion: %.6f rev/day\nPeriod: %.2f minutes\nApogee: %.2f km\nPerigee: %.2f km\n",
		m.currentOrb.InclinationDeg,
		m.currentOrb.Eccentricity,
		m.currentOrb.MeanMotion,
		m.currentOrb.PeriodMinutes,
		m.currentOrb.ApogeeKm,
		m.currentOrb.PerigeeKm,
	)
}

func (m Model) detailGroundTrackView() string {
	if m.currentSat == nil {
		return "No satellite loaded."
	}
	width := minInt(maxInt(m.width-6, 40), 80)
	height := minInt(maxInt(m.height-12, 12), 22)
	points := m.trackTrail
	if len(points) == 0 {
		points = buildTrail(m.currentSat, time.Now(), 90*time.Minute, 5*time.Minute)
	}
	return renderWorldMap(points, width, height)
}

func (m Model) detailPassesView() string {
	if m.currentSat == nil {
		return "No satellite loaded."
	}
	if m.passesLoading {
		return "Calculating passes..."
	}
	if m.passesErr != nil {
		return "Pass prediction failed: " + m.passesErr.Error()
	}
	if len(m.passes) == 0 {
		return "No passes found. Press p to calculate."
	}
	var b strings.Builder
	b.WriteString("Sampled passes (1-minute steps; * means clipped window):\n")
	for i, pass := range m.passes {
		if i >= 6 {
			break
		}
		clipped := ""
		if pass.StartClipped || pass.EndClipped {
			clipped = " *"
		}
		b.WriteString(fmt.Sprintf(
			"- %s to %s | max %.1f° at %s%s\n",
			pass.Start.Format(time.RFC3339),
			pass.End.Format(time.RFC3339),
			pass.MaxElevationDeg,
			pass.MaxTime.Format(time.RFC3339), clipped,
		))
	}
	return b.String()
}

func (m Model) trackView() string {
	if m.currentTLE == nil || m.currentSat == nil {
		return "No satellite loaded. Use Explore or :track <id>."
	}
	state := "stopped"
	if m.trackRunning {
		state = "running"
	}
	var b strings.Builder
	b.WriteString(fmt.Sprintf("Tracking %s (%s) [%s]\n", m.currentTLE.Name, m.currentTLE.CatalogID, state))
	b.WriteString(fmt.Sprintf("Refresh: %s\n", m.settings.RefreshInterval()))
	b.WriteString("Keys: space toggle, s snapshot, r reload cached data\n\n")
	b.WriteString(fmt.Sprintf(
		"Time: %s\nLat: %.6f°\nLon: %.6f°\nAlt: %.3f km\nVelocity: %.3f km/s\n",
		m.currentPos.Time.Format(time.RFC3339),
		m.currentPos.LatDeg,
		m.currentPos.LonDeg,
		m.currentPos.AltKm,
		m.currentPos.VelocityKm,
	))
	if len(m.trackTrail) > 0 {
		b.WriteString("\nTrail (last 5):\n")
		start := maxInt(len(m.trackTrail)-5, 0)
		for _, pos := range m.trackTrail[start:] {
			b.WriteString(fmt.Sprintf("- %s | %.4f, %.4f (%.2f km)\n",
				pos.Time.Format(time.RFC3339), pos.LatDeg, pos.LonDeg, pos.AltKm))
		}
	}
	return b.String()
}

func (m Model) predictView() string {
	if m.currentTLE == nil || m.currentSat == nil {
		return "No satellite loaded. Use Explore or :norad <id>."
	}
	var b strings.Builder
	b.WriteString("Predict satellite position\n")
	b.WriteString("Input time: " + m.predictInput.View() + "\n\n")
	if m.predictResult != nil {
		result := m.predictResult
		b.WriteString(fmt.Sprintf(
			"Time: %s\nLat: %.6f°\nLon: %.6f°\nAlt: %.3f km\nMap: %s\n",
			result.Time.Format(time.RFC3339),
			result.LatDeg,
			result.LonDeg,
			result.AltKm,
			result.MapURL,
		))
	}
	return b.String()
}

func (m Model) reportView() string {
	if m.currentTLE == nil {
		return "No satellite loaded. Use Explore or :norad <id>."
	}
	var b strings.Builder
	b.WriteString(fmt.Sprintf("Report format: %s (press f to cycle)\n", m.reportFormat))
	b.WriteString("r generate, s save, Tab edit path, Esc finish editing\n\n")
	b.WriteString(m.reportPath.View() + "\n\n")
	if m.reportOutput != "" {
		preview := m.reportOutput
		if len(preview) > 1200 {
			preview = preview[:1200] + "\n..."
		}
		b.WriteString(preview)
	}
	if m.reportSaved != "" {
		b.WriteString("\n\nSaved to: " + m.reportSaved)
	}
	return b.String()
}

func (m Model) settingsView() string {
	labels := []string{
		"Refresh seconds",
		"Cache TTL seconds",
		"Observer latitude",
		"Observer longitude",
		"Observer altitude (km)",
		"Map provider",
	}
	var b strings.Builder
	b.WriteString("Settings (Ctrl+S save, Tab next field, Esc navigate)\n\n")
	for i, label := range labels {
		input := m.settingsInputs[i].View()
		cursor := " "
		if i == m.settingsIndex {
			cursor = ">"
		}
		b.WriteString(fmt.Sprintf("%s %-20s %s\n", cursor, label+":", input))
	}
	return b.String()
}

func helpView() string {
	return strings.Join([]string{
		"Help",
		"----",
		"left/right or h/l: switch screens",
		"tab/shift+tab: cycle focus",
		"/: focus search (Explore)",
		"?: toggle help, : open command",
		"q: back (home exits), Esc: leave an input",
		"pgup/pgdown: scroll content, Ctrl+S: save settings",
		"r: reload cached data, respecting cache TTL",
	}, "\n")
}

func tabLine(tabs []string, active int) string {
	parts := make([]string, 0, len(tabs))
	for i, tab := range tabs {
		if i == active {
			parts = append(parts, "["+tab+"]")
		} else {
			parts = append(parts, tab)
		}
	}
	return strings.Join(parts, " | ")
}

func joinColumns(left, right string, gap int) string {
	leftLines := strings.Split(left, "\n")
	rightLines := strings.Split(right, "\n")
	maxLines := maxInt(len(leftLines), len(rightLines))
	var b strings.Builder
	pad := strings.Repeat(" ", gap)
	for i := 0; i < maxLines; i++ {
		leftLine := ""
		rightLine := ""
		if i < len(leftLines) {
			leftLine = leftLines[i]
		}
		if i < len(rightLines) {
			rightLine = rightLines[i]
		}
		b.WriteString(leftLine + pad + rightLine)
		if i < maxLines-1 {
			b.WriteString("\n")
		}
	}
	return b.String()
}
