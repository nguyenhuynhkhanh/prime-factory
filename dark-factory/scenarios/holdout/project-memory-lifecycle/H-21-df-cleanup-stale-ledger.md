# Scenario: df-cleanup detects STALE_LEDGER when ledger references non-existent promoted test

## Type
edge-case

## Priority
medium — cross-check integrity.

## Preconditions
- Ledger FEAT-0003 has `promotedTests: [tests/feature-x.promoted.spec.js]`.
- `dark-factory/promoted-tests.json` does not contain that path (perhaps manually removed, or the promoted-tests.json was rebuilt and missed it).

## Action
`/df-cleanup` runs.

## Expected Outcome
- Cross-check detects the mismatch.
- Reports: "STALE_LEDGER: FEAT-0003 references test path not in promoted-tests.json: tests/feature-x.promoted.spec.js"
- Does NOT auto-fix.
- Suggestion: "Consider `/df-cleanup --rebuild-memory` to rebuild ledger from promoted-tests.json."

## Notes
Covers FR-28 STALE_LEDGER category and EC-27. Cross-directional integrity — ledger ↔ promoted-tests.json.
