# Scenario: Health check runs promoted tests and reports failures

## Type
feature

## Priority
high — passing on promotion day is not enough; tests must keep passing

## Preconditions
- `dark-factory/promoted-tests.json` has an entry for `user-auth`
- The promoted test file exists and has no `.skip()`
- When run, the test fails (e.g., source code changed, breaking the test)

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check runs the promoted test using the project's test command
- Test fails
- Reports: "FAILING: tests/user-auth.promoted.test.js" with failure output
- Does NOT auto-fix
- Continues checking other promoted tests (does not stop at first failure)

## Notes
NFR-2: Single pass — reads all, checks all, reports all at once.
