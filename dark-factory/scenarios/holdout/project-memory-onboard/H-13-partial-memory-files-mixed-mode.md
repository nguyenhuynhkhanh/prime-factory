# Scenario: H-13 — Partial memory files: mixed bootstrap + refresh mode

## Type
edge-case

## Priority
medium — EC-3. Developers sometimes delete one memory file by hand; the agent must handle the asymmetry.

## Preconditions
- onboard-agent file documents memory file handling.

## Action
Structural test asserts Phase 3.7 documents mixed-mode behavior:
1. Each of the three files (`invariants.md`, `decisions.md`, `ledger.md`) is evaluated INDEPENDENTLY for bootstrap-vs-refresh.
2. If `invariants.md` is present but `ledger.md` is absent → invariants is in refresh mode, ledger is in fresh-bootstrap mode; both sign-offs happen in the same session but as separate batches.
3. The sign-off summary clearly labels which files are in refresh mode vs bootstrap mode, so the developer knows what to expect.

## Expected Outcome
- Per-file independent mode determination documented.
- Summary labeling documented.

## Failure Mode (if applicable)
If the documentation assumes all three files are in the same mode, test fails. If labeling is not documented, test names the omission.

## Notes
This is a rare case but important — developers do hand-edit and hand-delete these files during experimentation. The agent must be robust.
