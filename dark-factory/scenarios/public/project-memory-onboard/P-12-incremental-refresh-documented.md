# Scenario: P-12 — Incremental refresh on re-run proposes diffs, does not overwrite

## Type
feature

## Priority
critical — FR-19, FR-20. Without incremental refresh, every `/df-onboard` run would nuke accumulated memory.

## Preconditions
- onboard-agent file has been updated with incremental refresh documentation (within Phase 3.7 or in a dedicated subsection).

## Action
Structural test asserts the agent file documents:
1. On re-run with an existing `dark-factory/memory/`, the agent MUST NOT overwrite.
2. The agent re-scans the codebase for invariant candidates.
3. Candidates not already in the on-disk registry are proposed as new (go through sign-off).
4. Existing entries whose `sourceRef` no longer resolves are flagged as **potentially stale** and proposed for **review** (not automatic delete).
5. Unchanged entries are silently preserved (no prompt).
6. The same per-entry sign-off pattern as bootstrap applies to additions and stale proposals.
7. Retirement is implemented as a **status flip** (e.g., `status: retired`) — never a file/entry delete.

## Expected Outcome
- All seven assertions pass.
- The word `overwrite` appears in a prohibitive context (e.g., "must not overwrite", "do NOT overwrite").
- The status-flip mechanism is explicitly documented.

## Failure Mode (if applicable)
If any assertion fails, test names the missing element.

## Notes
The status-flip contract is important because it allows the ledger/memory to retain history even as entries become irrelevant. Auto-delete would create holes in the numeric ID sequence and confuse downstream consumers.
