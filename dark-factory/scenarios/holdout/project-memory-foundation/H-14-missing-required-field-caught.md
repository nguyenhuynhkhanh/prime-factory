# Scenario: Skeleton with a required field missing is caught by the setup test

## Type
edge-case

## Priority
critical — if a setup test doesn't catch a missing required field in the shipped skeleton, every downstream sub-spec inherits broken memory.

## Preconditions
- `tests/dark-factory-setup.test.js` exists with the new memory assertions.
- The current shipped skeletons are well-formed.

## Action
Run the test suite normally against the current shipped files — expect a clean pass.

Then, temporarily introduce a defect: remove the `enforced_by` field (AND the `enforcement` field) from the TEMPLATE entry in `dark-factory/memory/invariants.md`. Re-run the test suite.

Also test: remove the `summary` field from the FEAT-TEMPLATE entry in `ledger.md`. Re-run the test suite.

Restore the files after the test.

## Expected Outcome
- Baseline (unmodified) run: all tests pass.
- With `enforced_by` AND `enforcement` both removed: at least one assertion fails with a message identifying the missing field.
- With `summary` removed from the ledger TEMPLATE: at least one assertion fails with a message identifying the missing field.
- No test hangs or crashes — all failures are deterministic.

## Notes
Validates EC-6, FR-18. This is a test-the-tests scenario: verifies that the new setup assertions actually catch malformed skeletons, not just assert the file exists.
