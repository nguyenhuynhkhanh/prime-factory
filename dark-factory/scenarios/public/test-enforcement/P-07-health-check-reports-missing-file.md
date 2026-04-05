# Scenario: Health check detects and reports a missing promoted test file

## Type
feature

## Priority
critical — detecting deleted tests is the core purpose of the registry

## Preconditions
- `dark-factory/promoted-tests.json` exists with an entry for `user-auth` pointing to `tests/user-auth.promoted.test.js`
- The file `tests/user-auth.promoted.test.js` has been deleted

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check reads `dark-factory/promoted-tests.json`
- Checks file existence for each entry
- Reports: "MISSING: tests/user-auth.promoted.test.js (promoted from user-auth)"
- Health check completes and continues to normal df-cleanup behavior (manifest scan)
- Does NOT auto-fix — just reports

## Notes
BR-4: Health check reports all issues, asks developer what to do.
