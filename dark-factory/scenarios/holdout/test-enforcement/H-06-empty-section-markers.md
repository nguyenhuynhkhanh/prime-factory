# Scenario: Health check detects empty content between section markers

## Type
edge-case

## Priority
medium — someone might delete the tests but leave the markers

## Preconditions
- Registry entry for `login-fix` with `"colocated": true` pointing to `tests/auth/auth.test.js`
- The file exists and contains:
  ```
  // DF-PROMOTED-START: login-fix
  // DF-PROMOTED-END: login-fix
  ```
  (markers present but no test code between them)

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check finds the file, finds the markers
- Detects no test content between markers
- Reports: "EMPTY: tests/auth/auth.test.js section for login-fix has no test content"
- Does NOT report as MISSING (file and markers exist)

## Notes
EC-6: Empty section is distinct from missing file. Both are problems but reported differently.
