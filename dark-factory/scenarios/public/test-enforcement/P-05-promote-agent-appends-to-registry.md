# Scenario: Promote-agent appends to existing registry with multiple files

## Type
feature

## Priority
high — verifies the registry grows correctly over multiple promotions

## Preconditions
- `dark-factory/promoted-tests.json` exists with one entry (from a previous promotion)
- promote-agent has successfully placed tests for feature `payment-flow`
- Promoted files: `tests/payment-flow.promoted.test.js` (unit) and `e2e/payment-flow.promoted.e2e.spec.js` (e2e)
- 8 holdout scenarios were the source

## Action
Promote-agent completes Step 7 (Update Registry)

## Expected Outcome
- `dark-factory/promoted-tests.json` now has 2 entries in `promotedTests` array
- The existing entry is unchanged
- The new entry has:
  - `"feature": "payment-flow"`
  - `"files"` array with 2 entries (unit + e2e)
  - `"holdoutScenarioCount": 8`
- File is valid JSON

## Notes
EC-9: Multiple promoted test files for a single feature are stored as an array of file objects.
