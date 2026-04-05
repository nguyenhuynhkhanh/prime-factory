# Scenario: Health check detects .skip() on promoted tests

## Type
feature

## Priority
high — skipped tests provide zero safety

## Preconditions
- `dark-factory/promoted-tests.json` has an entry for `user-auth` pointing to `tests/user-auth.promoted.test.js`
- The file exists but contains `.skip(` or `test.skip(` within the promoted test code

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check reads the promoted test file
- Detects `.skip()` usage
- Reports: "SKIPPED: tests/user-auth.promoted.test.js contains .skip() on promoted tests"
- Does NOT auto-fix

## Notes
Also detects `it.skip(`, `describe.skip(`, `test.skip(`, `xit(`, `xdescribe(`, and `xtest(` patterns. Also detects commented-out test blocks (lines starting with `//` that contain `it(` or `test(` or `describe(`).
