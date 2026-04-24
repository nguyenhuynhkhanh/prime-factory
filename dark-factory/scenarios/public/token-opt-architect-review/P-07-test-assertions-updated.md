# Scenario: Test file has 3 targeted tier assertions and updated token cap

## Type
feature

## Priority
critical -- test assertions are the structural guarantee that the pipeline enforces the tiering contract; incorrect or missing assertions allow regressions

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated as part of this feature
- The old `"architect-agent runs minimum 3 rounds"` test has been replaced

## Action
Run `node --test tests/dark-factory-setup.test.js` against the updated test file and updated architect-agent.

## Expected Outcome
- The test `"architect-agent runs minimum 3 rounds"` NO LONGER EXISTS in the test file
- Three new tests exist in its place:
  1. `"architect-agent uses tiered language (Tier 1, Tier 2, Tier 3)"` — asserts that architect-agent.md contains "Tier 1", "Tier 2", "Tier 3" with round budget for each
  2. `"architect-agent Tier 3 specifies minimum 3 rounds (safety floor)"` — asserts that Tier 3 mentions minimum 3 rounds or "3+ rounds"
  3. `"architect-agent Tier 1 specifies exactly 1 round"` — asserts that Tier 1 mentions "1 round"
- The `agentCaps["architect-agent"]` value is `5000` (not `4500`)
- The token cap test for architect-agent passes with the updated 5,000 limit
- All 331+ existing tests continue to pass (no regressions)

## Notes
Validates FR-12 (test assertions), EC-11 (token cap). This scenario tests the TEST file itself — the code-agent must update both the assertion logic and the cap constant in the same file without breaking adjacent tests.
