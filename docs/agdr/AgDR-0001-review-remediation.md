---
id: AgDR-0001
timestamp: 2026-10-27T15:46:31Z
agent: codex
model: unspecified
session: 01a17c04-502c-7bd0-a196-26b0541f4e5f
trigger: user-prompt
status: executed
---

# Own request data and share input and cache rules

> In the context of the architecture review, facing incorrect TUI state and duplicate IO rules, I decided to bind related results and share typed parsing and cache functions to correct all P1 and P2 findings, accepting a contained internal refactor.

## Context

- The user requested a draft PR for findings A1 through A10.
- Public Go APIs, JSON v1, cache priority, and numerical behavior must remain compatible.
- The TUI must reject previous results and cancel obsolete work.
- The catalog must preserve useful deadline results and coordinate same-key refreshes.

## Options considered

| Option | Benefits | Costs |
|---|---|---|
| Add guards within each existing workflow | Small initial changes | Retains duplicate parsing, cache policy, and separate metadata lifecycles. |
| Bind related data and share private typed operations | Corrects ownership and removes duplicate rules without new dependencies | Requires internal call-site and test updates. |
| Introduce a provider framework and general state library | Supports broad future extension | Adds dependencies and concepts beyond current needs. |

## Decision

Choose cohesive values and shared typed operations because they correct the identified failures within the existing architecture.

- Carry a record and retrieval metadata together through search and selection.
- Associate passes and ticks with their input or session identity.
- Pair result identifiers with contexts that cancel obsolete work.
- Preserve useful search results on deadline expiry. Keep explicit cancellation as an error.
- Use one cache lifecycle with typed decoders and explicit legacy fallback.
- Coordinate refreshes by key. Waiting callers retain independent cancellation.
- Own TLE validation below catalog in `internal/elements`. Preserve legacy public structs through adapters.
- Write report replacements through a temporary file in the destination directory.
- Use browser request identifiers and abort controllers to preserve the active selection.

## Consequences

- No numerical engine changes or new runtime dependencies are required.
- Existing signatures remain available through compatibility wrappers.
- Per-key coordination is process-local. Separate processes can still refresh the same file.
- Equivalent overlapping refreshes share an outcome. Valid fresh hits bypass coordination.
- Default search remains sequential. This change first corrects its result and cancellation contract.
- Regression tests must cover replacement, cancellation, malformed input, and file failure paths.

## Artifacts

- `docs/reviews/architecture-2026-10-27/report.md`
- Remediation draft PR to be added after publication.
