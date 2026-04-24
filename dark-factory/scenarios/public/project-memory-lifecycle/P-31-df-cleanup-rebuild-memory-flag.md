# Scenario: df-cleanup `--rebuild-memory` flag rebuilds ledger from promoted-tests.json

## Type
feature

## Priority
medium — recovery path when memory is malformed.

## Preconditions
- df-cleanup/SKILL.md edited.

## Action
Read df-cleanup/SKILL.md.

## Expected Outcome
- `--rebuild-memory` is documented as an optional flag (parallel to existing `--rebuild` for promoted-tests).
- When invoked, it reconstructs `dark-factory/memory/ledger.md` from `dark-factory/promoted-tests.json` entries (each promoted test entry becomes a FEAT row).
- It does NOT rebuild `invariants.md` or `decisions.md`.
- If invariants/decisions are malformed, the flag emits: "Invariants/decisions cannot be auto-rebuilt. Run `/df-onboard` to re-extract."
- The flag shows the rebuilt ledger to the developer before writing (consistent with `--rebuild`).

## Notes
Covers FR-29, BR-14.
