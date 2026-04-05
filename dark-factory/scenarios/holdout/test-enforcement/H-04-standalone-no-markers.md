# Scenario: Standalone promoted test files do NOT get section markers

## Type
edge-case

## Priority
medium — ensures BR-5 is respected

## Preconditions
- promote-agent places tests in a new standalone file: `tests/my-feature.promoted.test.js`
- The tests are NOT appended to an existing file

## Action
Promote-agent completes Step 5 (Place Tests) and Step 7 (Update Registry)

## Expected Outcome
- The promoted test file does NOT contain `// DF-PROMOTED-START:` or `// DF-PROMOTED-END:`
- The registry entry has `"sectionMarkers": false`
- The registry entry's file object has `"colocated": false`
- No `"startMarker"` or `"endMarker"` fields in the file object

## Notes
BR-5: Markers are ONLY for co-located tests. This verifies the negative case.
