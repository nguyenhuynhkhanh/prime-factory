# Scenario: Health check handles co-located test file deletion

## Type
edge-case

## Priority
medium — section markers are irrelevant when the whole file is gone

## Preconditions
- Registry entry for `login-fix` with `"colocated": true` pointing to `tests/auth/auth.test.js`
- Entry has `"startMarker"` and `"endMarker"` fields
- The entire file `tests/auth/auth.test.js` has been deleted

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check checks file existence first
- File is missing
- Reports: "MISSING: tests/auth/auth.test.js (promoted from login-fix)"
- Does NOT attempt to read section markers (file is gone)
- Does NOT crash or error on missing markers

## Notes
EC-5: File deletion trumps marker checking. Check existence first, then content.
