# Verification record

Review date: 2026-10-27

Commit: `edd02fd89c22bf5443f77e6e702f62c94b13ce00`

## Existing checks

Run these commands from the repository root. Use temporary Go caches if the default cache directories are unavailable.

```sh
GOCACHE=/tmp/tlego-review-go-cache GOMODCACHE=/tmp/tlego-review-go-mod go test ./...
GOCACHE=/tmp/tlego-review-go-cache GOMODCACHE=/tmp/tlego-review-go-mod go test -race -coverprofile=/tmp/tlego-review-coverage.out ./...
GOCACHE=/tmp/tlego-review-go-cache GOMODCACHE=/tmp/tlego-review-go-mod go vet ./...
node --test pkg/templates/viewer-state.test.js
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s examples/calendar -v
```

All checks passed. HTTP test servers require permission to open local sockets. Dependency retrieval requires network access when the cache is empty.

The race run reported 61.2% total statement coverage. The report contains package values and coverage limits.

## Complexity measurements

The retained program uses only the Go standard library. Run it from the repository root.

```sh
cp docs/reviews/architecture-2026-10-27/metrics.go.example /tmp/tlego-review-metrics.go
GOCACHE=/tmp/tlego-review-go-cache GO111MODULE=off go run /tmp/tlego-review-metrics.go > /tmp/tlego-review-complexity.csv
```

The program writes measurements to stdout. It writes file counts, exported function counts, and internal import edges to stderr.

The reviewed result was 60 non-test files, 29 test files, 8,457 lines, and 323 function declarations. The TUI model has 48 named fields.

## Targeted review probes

The probes below observe defects. Their assertions describe current behavior. Convert them to correct-behavior assertions when implementing corrections.

The review used temporary Go build overlays. It did not add tests or change application source files.

To repeat a package probe:

1. Save its code in a temporary file ending in `_test.go`.
2. Create an overlay that maps a new package test path to that file.
3. Run the package tests with the overlay.

Example overlay for the TUI probe:

```json
{
  "Replace": {
    "/absolute/repository/pkg/tui/architecture_review_probe_test.go": "/tmp/tlego-review-probe_test.go"
  }
}
```

Replace `/absolute/repository` with the current repository path. Use an absolute path for the temporary file.

```sh
GOCACHE=/tmp/tlego-review-go-cache GOMODCACHE=/tmp/tlego-review-go-mod go test -vet=off -overlay /tmp/tlego-review-overlay.json ./pkg/tui -run ArchitectureProbe -v
```

The overlay run disables vet because vet could not open the virtual test file. The separate repository-wide vet check passed.

For the catalog probe, map a new test path under `internal/catalog`. Then test `./internal/catalog`.

### Observed results

```text
TestArchitectureProbeOldTickRestarts: PASS
Confirmed: old tick reschedules while new timer is already pending

TestArchitectureProbeSelectionRetainsOtherMetadata: PASS
Confirmed: selected search record uses unrelated retrieval metadata

TestArchitectureProbeObserverChangeRetainsPasses: PASS
Confirmed: passes remain after observer changes

TestArchitectureProbeConcurrentMisses: PASS
Confirmed: four concurrent misses send four provider requests

TestArchitectureProbeDeadlineReturnsPartialWithError: PASS
Confirmed: search returns 1 partial records with cancellation error; caller must retain them

Legacy parser probe:
Confirmed: ReadTLEFile panics on line 2 without an ID: runtime error: index out of range [1] with length 1
```

### TUI probe source

```go
package tui

import (
	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	tea "github.com/charmbracelet/bubbletea"
	"testing"
	"time"
)

func TestArchitectureProbeOldTickRestarts(t *testing.T) {
	m := testModel(t)
	rs, e := catalog.ReadElements("../../examples/tui-demo/iss.tle")
	if e != nil {
		t.Fatal(e)
	}
	m.setCurrentElement(rs[0])
	m.setScreen(screenTrack)
	space := tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{' '}}
	m, first := m.updateTrack(space)
	if first == nil {
		t.Fatal("first timer missing")
	}
	m, _ = m.updateTrack(space)
	m, second := m.updateTrack(space)
	if second == nil {
		t.Fatal("second timer missing")
	}
	next, oldReschedules := m.Update(trackTickMsg(time.Now()))
	if oldReschedules == nil {
		t.Fatal("old tick rejected; issue absent")
	}
	if !next.(Model).trackRunning {
		t.Fatal("tracking stopped")
	}
	t.Log("Confirmed: old tick reschedules while new timer is already pending")
}
func TestArchitectureProbeSelectionRetainsOtherMetadata(t *testing.T) {
	m := testModel(t)
	rs, e := catalog.ReadElements("../../examples/tui-demo/iss.tle")
	if e != nil {
		t.Fatal(e)
	}
	m.currentMeta = catalog.FetchMeta{Path: "other-group.json", Stale: true, FetchedAt: time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)}
	next, _ := m.Update(searchResultsMsg{records: rs, results: buildElementSummaries(rs)})
	m = next.(Model)
	m.setScreen(screenExplore)
	m.focus = focusResultList
	m, _ = m.updateExplore(tea.KeyMsg{Type: tea.KeyEnter})
	if m.currentTLE == nil {
		t.Fatal("selection failed")
	}
	if m.currentMeta.Path != "other-group.json" {
		t.Fatal("metadata replaced; issue absent")
	}
	t.Log("Confirmed: selected search record uses unrelated retrieval metadata")
}
func TestArchitectureProbeObserverChangeRetainsPasses(t *testing.T) {
	m := testModel(t)
	m.passes = []Pass{{Start: time.Now(), End: time.Now().Add(time.Minute)}}
	m.setScreen(screenSettings)
	m.settingsInputs[2].SetValue("51.48")
	m, _ = m.updateSettings(tea.KeyMsg{Type: tea.KeyCtrlS})
	if m.settings.Observer.Lat != 51.48 {
		t.Fatalf("settings not saved: %s", m.status)
	}
	if len(m.passes) != 1 {
		t.Fatal("passes invalidated; issue absent")
	}
	t.Log("Confirmed: passes remain after observer changes")

}
```

### Catalog probe source

```go
package catalog

import (
	"context"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

type architectureTransport func(*http.Request) (*http.Response, error)

func (f architectureTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func TestArchitectureProbeConcurrentMisses(t *testing.T) {
	b, e := os.ReadFile("../elements/testdata/25544.json")
	if e != nil {
		t.Fatal(e)
	}
	var count atomic.Int32
	var ready sync.WaitGroup
	ready.Add(4)
	release := make(chan struct{})
	s := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: architectureTransport(func(r *http.Request) (*http.Response, error) {
		count.Add(1)
		ready.Done()
		<-release
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(string(b)))}, nil
	})})
	var done sync.WaitGroup
	for i := 0; i < 4; i++ {
		done.Add(1)
		go func() {
			defer done.Done()
			_, _, e := s.FetchElementByNorad(context.Background(), "25544")
			if e != nil {
				t.Error(e)
			}
		}()
	}
	ready.Wait()
	close(release)
	done.Wait()
	if count.Load() != 4 {
		t.Fatalf("requests=%d", count.Load())
	}
	t.Log("Confirmed: four concurrent misses send four provider requests")
}
func TestArchitectureProbeDeadlineReturnsPartialWithError(t *testing.T) {
	b, e := os.ReadFile("../elements/testdata/25544.json")
	if e != nil {
		t.Fatal(e)
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	count := 0
	s := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: architectureTransport(func(r *http.Request) (*http.Response, error) {
		count++
		if count > 1 {
			cancel()
			return nil, ctx.Err()
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(string(b)))}, nil
	})})
	result, e := s.SearchElements(ctx, "")
	if e == nil || len(result.Records) == 0 {
		t.Fatalf("records=%d error=%v", len(result.Records), e)
	}
	t.Logf("Confirmed: search returns %d partial records with cancellation error; caller must retain them", len(result.Records))
}
```

### Legacy parser probe source

Save this source as a temporary `.go` file. Run it with `go run` from the repository root.

```go
package main

import (
	"fmt"
	"github.com/Mohammed-Ashour/tlego/pkg/tle"
	"os"
)

func main() {
	f, e := os.CreateTemp("", "tlego-short-line-*.tle")
	if e != nil {
		panic(e)
	}
	defer os.Remove(f.Name())
	f.WriteString("2 \n")
	f.Close()
	defer func() {
		if p := recover(); p != nil {
			fmt.Printf("Confirmed: ReadTLEFile panics on line 2 without an ID: %v\n", p)
		}
	}()
	_, e = tle.ReadTLEFile(f.Name())
	fmt.Printf("error=%v\n", e)
}
```

## Numerical source comparison

The comparison used the pinned module at revision `5e798e1d6f5b`.

For each file, replace the first package declaration in the local source. Then compare the complete text with the dependency source.

| Local file | Dependency file | Result |
|---|---|---|
| `internal/sgp4/sgp4.go` | `pkg/satellite/sgp4.go` | Exact match after package-name normalization |
| `internal/sgp4/dspace.go` | `pkg/satellite/dspace.go` | Exact match after package-name normalization |

The comparison does not independently prove numerical correctness. The existing orbit tests include a separate deep-space vector reference.
