---
id: AgDR-0002
timestamp: 2026-10-28T19:37:29Z
agent: codex
model: unspecified
session: 01a17c04-502c-7bd0-a196-26b0541f4e5f
trigger: user-prompt
status: executed
---

# Preserve report and reload behavior after atomic replacement

> In the context of PR #38, facing four confirmed regressions and a browser state gap, I decided to preserve supported file and tracking behavior with focused corrections, accepting private permissions for newly created reports.

## Context

- The user requested corrections and a push to the existing draft PR.
- Report replacement must preserve failure isolation and existing destination permissions.
- Existing report symlinks must keep their target semantics.
- Tracking reload and refresh coordination must retain their session and cancellation protections.

## Options considered

| Option | Benefits | Costs |
|---|---|---|
| Reject all report symlinks and retain private temporary files | Small file-writing change | Rejects previously supported report paths. |
| Resolve existing symlinks and keep new reports private | Preserves valid link destinations and avoids weakening the umask | Unresolved or dangling destination links return an error. |
| Add platform-specific file replacement and permission layers | More platform controls | Adds complexity beyond the reported defects. |

## Decision

Choose existing-link resolution and private new reports because this preserves supported destinations without creating broader permissions.

- Resolve existing destination symlinks before temporary-file creation and replacement.
- Reject unresolved links before writing. Keep checked replacement in the target directory.
- Keep new temporary-file permissions without chmod. Preserve existing destination mode on replacement.
- Resume successful reloads of the same tracked satellite with one new session tick.
- Share one private default HTTP client between stores. Keep explicitly supplied clients distinct.
- Clear browser satellite choices when loading a group. Keep empty choices disabled after failure.

## Consequences

- New reports use mode 0600 or stricter on Unix, depending on the umask.
- Existing valid destination links remain intact. Dangling links fail without replacement.
- Coordination stays process-local and retains independent waiter cancellation.
- No new runtime dependency or numerical engine change is required.

## Artifacts

- Draft PR: [#38](https://github.com/Mohammed-Ashour/tlego/pull/38).
- Review baseline: `6b6797e4d73a06d39d9300d734055ca8ffc81617`.
