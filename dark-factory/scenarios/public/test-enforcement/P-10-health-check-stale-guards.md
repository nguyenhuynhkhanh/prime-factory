# Scenario: Health check flags stale guard annotations

## Type
feature

## Priority
medium — stale guards are informational, not blocking

## Preconditions
- `dark-factory/promoted-tests.json` has an entry for `user-auth`
- The promoted test file exists and passes
- The file contains `// Guards: src/auth/auth.service.js:42, src/auth/token.js:15`
- `src/auth/token.js` has been deleted

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check reads the `// Guards:` annotation
- Checks each referenced file path (strips line numbers per EC-13)
- `src/auth/auth.service.js` exists — no flag
- `src/auth/token.js` does not exist — flags: "STALE GUARD: tests/user-auth.promoted.test.js references src/auth/token.js which no longer exists"
- Does NOT report the test as failing or missing (it still works)

## Notes
BR-11: Only checks file existence, not line numbers. Line numbers shift constantly and checking them would produce too many false positives.
