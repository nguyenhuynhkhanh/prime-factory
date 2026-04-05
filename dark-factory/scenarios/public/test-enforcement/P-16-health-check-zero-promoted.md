# Scenario: Health check with zero promoted tests

## Type
edge-case

## Priority
medium — graceful handling of the empty state

## Preconditions
- `dark-factory/promoted-tests.json` exists with `"promotedTests": []`

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check reads the registry
- Finds zero entries
- Reports: "No promoted tests found. Run /df-orchestrate to promote tests."
- Does NOT error
- Continues to normal df-cleanup behavior (manifest scan)

## Notes
BR-9: This is an expected state for new projects. Not an error condition.
