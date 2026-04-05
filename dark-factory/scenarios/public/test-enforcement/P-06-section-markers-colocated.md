# Scenario: Promote-agent adds section markers for co-located tests

## Type
feature

## Priority
high — markers are the only way to detect deletion of co-located promoted tests

## Preconditions
- promote-agent determines tests should be co-located (appended to existing `tests/auth/auth.test.js`)
- Feature name: `login-rate-limit`

## Action
Promote-agent places tests in Step 5 (Place Tests)

## Expected Outcome
- The promoted test block in `tests/auth/auth.test.js` is wrapped with:
  ```
  // DF-PROMOTED-START: login-rate-limit
  <promoted test code>
  // DF-PROMOTED-END: login-rate-limit
  ```
- The registry entry has `"sectionMarkers": true`
- The registry entry's file object has `"startMarker"` and `"endMarker"` fields
- The `"colocated"` field is `true`

## Notes
BR-5: Section markers are ONLY for co-located tests. Standalone files do NOT get markers.
