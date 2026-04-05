# Scenario: Health check ignores .skip() in non-promoted tests within co-located file

## Type
edge-case

## Priority
high — false positives would erode trust in the health check

## Preconditions
- Registry entry for `login-fix` with `"colocated": true`, `"sectionMarkers": true` in `tests/auth/auth.test.js`
- The file contains:
  - Original (non-promoted) tests with `it.skip("legacy test", ...)` OUTSIDE the markers
  - Promoted tests within `DF-PROMOTED-START`/`DF-PROMOTED-END` markers with NO `.skip()`

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check reads the file
- Only examines content BETWEEN the section markers for the `login-fix` entry
- Does NOT flag the `.skip()` outside the markers
- Reports: no issues for `login-fix`

## Notes
EC-7: Health check scopes `.skip()` detection to the promoted region only. For standalone files, the entire file is the promoted region.
