# Scenario: `--rebuild-memory` without promoted-tests.json → non-destructive failure

## Type
failure-recovery

## Priority
medium — recovery command must not cause data loss.

## Preconditions
- Existing `dark-factory/memory/ledger.md` has 5 FEAT entries.
- `dark-factory/promoted-tests.json` does NOT exist (deleted / never created).

## Action
`/df-cleanup --rebuild-memory` runs.

## Expected Outcome
- Detects missing promoted-tests.json.
- Emits: "Cannot rebuild ledger — `dark-factory/promoted-tests.json` not found. Existing ledger unchanged."
- Does NOT delete or overwrite the existing ledger.
- Does NOT create an empty ledger.
- Exits cleanly.

## Notes
Covers EC-22. Adversarial — naive impl might write an empty ledger ("rebuild from nothing"), destroying existing data.
