# Scenario: `--rebuild-memory` rebuilds ledger, NEVER invariants/decisions

## Type
edge-case

## Priority
high — scope boundary of the flag.

## Preconditions
- `dark-factory/memory/invariants.md` is malformed.
- `dark-factory/memory/decisions.md` is malformed.
- `dark-factory/memory/ledger.md` is malformed.
- `dark-factory/promoted-tests.json` has 4 entries.

## Action
`/df-cleanup --rebuild-memory` runs.

## Expected Outcome
- `ledger.md` is reconstructed with 4 FEAT entries (one per promoted-tests.json entry).
- `invariants.md` is NOT rebuilt; still malformed.
- `decisions.md` is NOT rebuilt; still malformed.
- Output: "Ledger rebuilt from promoted-tests.json (4 entries)."
- Output: "Invariants/decisions cannot be auto-rebuilt. Run `/df-onboard` to re-extract."
- Shows the reconstructed ledger to the developer before writing (consistent with `--rebuild`).

## Notes
Covers FR-29, BR-14. Adversarial — naive impl might "helpfully" regenerate invariants/decisions from some heuristic, which would overwrite real content or hallucinate.
