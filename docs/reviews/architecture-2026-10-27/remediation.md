# Architecture review corrections

Date: 2026-10-27

Branch: `fix/architecture-review-findings`

Review baseline: `edd02fd89c22bf5443f77e6e702f62c94b13ce00`

All P1 and P2 findings from the [baseline report](report.md) have corrections and regression tests.

## Finding map

| Finding | Correction | Main regression checks |
|---|---|---|
| A1, selected metadata | `catalog.ElementEntry` binds each record to its retrieval metadata. Group and search selection preserve that value. | TUI group/search selection, report warning and visible warning tests; catalog deduplication metadata test. |
| A2, old pass results | Pass results retain element version, observer, window and sample step. Observer and element changes invalidate them. | Observer change and late result rejection; pass completion clears loading; result view shows its inputs. |
| A3, parser panic | `internal/elements` owns line and payload validation. The public parser adapts shared results to its existing types. | Short lines, missing IDs, unpaired lines, mismatched IDs, invalid numeric fields and parser parity. |
| A4, duplicate timers | Each tracking tick identifies its session. Stop, restart, navigation and satellite changes invalidate previous sessions. | Previous-session tick cannot change the trail or schedule another timer. |
| A5, obsolete work | Requests inherit the program context. Replacement, navigation and quit cancel active work. Pass sampling checks cancellation. | Blocked HTTP transport tests for replacement, navigation, quit and parent cancellation; pass-loop cancellation. |
| A6, partial search | Deadline expiry retains successful group coverage and warnings. Explicit cancellation remains an error. | Both catalog formats; CLI partial output and coverage warning; CLI cancellation with empty stdout. |
| A7, duplicate cache rules | One private typed cache lifecycle handles validation, persistence, freshness and fallback. | Existing cache tests, both formats, malformed refresh and persistence failure. |
| A8, duplicate refreshes | Equivalent overlapping requests share outcomes. Fresh hits bypass active refreshes. Waiters cancel independently and receive independent data. | Concurrent miss, failure and force refresh; mixed TTL; canceled leader/waiter; independent keys, raw bytes and legacy pointers. |
| A9, previous browser responses | One selection request owns its abort signal and generation. Scene replacement follows complete successful retrieval. | Reverse group/position response order, selection changes, HTTP failure, invalid JSON and complete update tests. |
| A10, report replacement | Report save checks a temporary file before replacement. Failure preserves old contents and removes temporary files. | Write, short write, close and rename failures; successful replacement preserves existing permissions. |

## Architecture changes

`ARCHITECTURE.md` now describes shared TLE parsing, cache coordination, selected metadata, request cancellation and pass identity.

The numerical engine and transport schemas remain unchanged. Public legacy parser and pass-planning signatures remain available.

The new context-aware pass APIs also serve the CLI. The experimental browser uses a small local request module with no new dependency.

The [decision record](../../agdr/AgDR-0001-review-remediation.md) contains the selected approach and its tradeoffs.

## Verification

The following checks passed:

```sh
go test -race ./...
go vet ./...
node --test public/catalog-requests.test.mjs pkg/templates/viewer-state.test.js
python3 -m unittest discover -s examples/calendar -v
GOOS=windows GOARCH=amd64 go test -exec=true ./...
git diff --check
```

Go checks used temporary build and module caches. Local HTTP tests required socket access.

The Windows command compiled packages and tests. It did not execute Windows binaries on macOS.

The JavaScript run completed 11 tests. The Python run completed six tests.

Focused catalog concurrency tests passed ten race-enabled repetitions after timing assumptions were removed. Waiter synchronization and deadline injection use explicit signals.

A packaged binary also passed these checks from a temporary directory outside the checkout:

- Predict a nine-digit GP catalog ID with JSON v1 output.
- Reject malformed local input with JSON stderr and empty stdout.
- Generate a pass plan and convert it with the independent Python calendar consumer.

A browser check used a local fixture API. Initial satellite loading, group changes and HTTP failure behavior passed. The failure retained the previous scene and data.

## Review limits

Refresh coordination is process-local. Separate processes can still refresh the same file.

Search remains sequential. Its deadline and partial-result contract is now explicit.

Windows runtime tests remain the responsibility of the existing Windows CI job. Local cross-compilation does not establish Windows runtime behavior.

The baseline measurements and defect probes describe the review commit. The new regression tests verify the corrected behavior.
