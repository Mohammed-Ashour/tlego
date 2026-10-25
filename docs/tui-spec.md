# TLEGO terminal UI

Status: initial implementation. This document describes the shipped baseline, not the future shared-core or extension API.

## Entry points

```bash
tlego tui
tlego tui --norad 25544
tlego tui --group "Space Stations"
tlego tui --track 25544
tlego tui --screen Settings
```

`--track` opens Track, where Space starts updates. Track takes precedence over NORAD, then group, then screen when multiple startup options are provided. Screen names are case-insensitive.

## Implemented screens

| Screen | Behavior |
|---|---|
| Home | Quick actions and five recent catalog IDs |
| Explore | Group browsing, selected-group filtering, all-group searches, result selection |
| Detail | Summary, original TLE, estimated orbital parameters, ASCII ground track, sampled passes |
| Track | Start/stop position updates, bounded trail and textual snapshot |
| Predict | Point-in-time coordinates from RFC3339, now or signed duration/day offsets |
| Reports | Text, JSON and CSV exports with editable local save path |
| Settings | Refresh interval, cache TTL, observer coordinates/altitude and map provider |

## Keyboard behavior

- Left/Right or h/l move between screens when not editing text.
- Escape leaves an input. q returns Home, then exits from Home. Ctrl+C exits everywhere, including command mode.
- `/` on Explore enters search. Enter filters the selected group or searches all groups when no group is selected. Escape then a searches all groups. Tab cycles search/groups/results. Enter selects the focused item.
- `:` starts a command: norad, group, track, search, screen, help, quit or exit.
- Space toggles Track updates. Leaving Track stops its updates.
- Detail uses 1-5 or brackets for tabs. p on Passes calculates the next 24 hours for the configured observer.
- Reports uses f to cycle formats, r to generate, Tab to edit a path, Enter or Escape to finish editing, then s to save.
- Settings uses Tab/Shift+Tab or Up/Down to choose fields and Ctrl+S to save. Printable shortcut characters remain normal text while editing.
- Page Up/Page Down scroll long content. `?` shows help when outside an input.

## Layout and status

The rendered frame is bounded by the terminal dimensions and reserves space for status and warnings. Explore uses equal-width columns from 100 columns onward. Narrow terminals show the focused list, with group browsing shown first when there are no results. Lists retain their own pagination and selection controls. The baseline is tested at 80x24, 100x30 and 140x40.

Errors, failed-group search coverage and stale-cache warnings remain visible in the footer. Superseded asynchronous results cannot replace a newer selection, filter or generated report. Navigation abandons outstanding result application.

## Data and persistence

- The default group catalog is embedded in the binary, so installation does not require source files.
- TUI caches use the platform user cache directory under tlego. Settings use the platform user configuration directory under tlego/tui.yaml. Absolute XDG_CONFIG_HOME overrides the configuration directory on all platforms.
- Fetches have a client timeout and a bounded response body. IDs and TLE structure/numeric inputs are checked before use. Validated downloads replace cache files atomically.
- A refresh failure may use the last validated stale cache with a visible warning. Corrupt caches trigger another fetch. Explicit request cancellation remains an error.
- Cached group/search records remain selectable offline. Global searches deduplicate catalog IDs and disclose groups that failed or used stale data.
- Settings saves preserve recent IDs and replace files atomically. Invalid settings fall back to defaults with a warning; a failed save leaves active settings unchanged.
- r reloads through the cache according to TTL. It does not force a provider download.

## Scientific and compatibility limits

Positions are computed using UTC, displayed in degrees and km, and use the propagated velocity vector for km/s speed. Longitude is normalized to [-180,180). This corrects the TUI path only; older CLI calculations have separate tracked issues.

Pass times and maxima are sampled at one-minute steps, not refined event roots. Start/end-clipped passes are marked. Configure your observer first; the default is 0 latitude, 0 longitude and 0 km altitude. These results do not establish optical visibility, precision antenna control or collision risk.

Orbit classes are altitude-based heuristics, and apogee/perigee are estimates. Element freshness and scientific calibration remain separate concerns. Live retrieval uses GP JSON and retains catalog IDs up to nine digits. Legacy TLE caches remain usable. The element tab labels GP JSON and shows its original fields.

Report JSON is an unversioned local export. The planned external schema and executable plugin contract are not implemented by this change. Theme is retained in persisted settings for compatibility but has no editor control until rendering supports it.

## Verification

Deterministic tests cover focused text entry, settings saves, stale-result rejection, terminal bounds, UTC/unit conversion, vector speed, relative time parsing, pass clipping and safe cache behavior. HTTP tests use local fixtures. An interactive terminal smoke check covers startup, Settings navigation and exit. Independent scientific calibration and full provider integration are separate work.

## Follow-up

The review backlog is [GitHub issues 16-29](https://github.com/Mohammed-Ashour/tlego/issues). The [shared core and extension plan](https://github.com/Mohammed-Ashour/tlego/issues/29) follows this baseline. Fixes here cover only the stated TUI behavior; broader issues stay open until their complete acceptance criteria pass.
