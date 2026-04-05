# Scenario: Code-agent feature mode detects regression in existing tests

## Type
feature

## Priority
critical — the whole point of running ALL tests

## Preconditions
- code-agent is in feature mode implementing `new-feature`
- The project has 50 existing tests (unrelated to `new-feature`)
- code-agent's implementation breaks an existing test in `tests/user.test.js`

## Action
Code-agent runs ALL existing tests after implementation (step 6)

## Expected Outcome
- code-agent runs the full test suite (not just `new-feature` tests)
- Detects failure in `tests/user.test.js`
- Reports the regression: which test failed and why
- Does NOT report success

## Failure Mode
If code-agent only runs its own tests, the regression in `tests/user.test.js` goes undetected until holdout validation or later.

## Notes
FR-7: This validates that the text change from "Run tests to verify implementation" to "Run ALL existing tests to verify no regression" changes actual behavior.
