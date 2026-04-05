# Scenario: Promote-agent creates promoted-tests.json on first promotion

## Type
feature

## Priority
critical — the registry is the foundation for all downstream enforcement

## Preconditions
- `dark-factory/promoted-tests.json` does NOT exist
- promote-agent has successfully placed tests for feature `user-auth`
- Promoted test file: `tests/user-auth.promoted.test.js` (standalone, not co-located)
- 5 holdout scenarios were the source

## Action
Promote-agent completes Step 7 (Update Registry)

## Expected Outcome
- `dark-factory/promoted-tests.json` is created with:
  ```json
  {
    "version": 1,
    "promotedTests": [
      {
        "feature": "user-auth",
        "type": "feature",
        "files": [
          {
            "path": "tests/user-auth.promoted.test.js",
            "colocated": false
          }
        ],
        "promotedAt": "<ISO 8601 timestamp>",
        "holdoutScenarioCount": 5,
        "annotationFormat": "header-comment",
        "sectionMarkers": false
      }
    ]
  }
  ```
- File is valid JSON
- File is NOT in `.gitignore`

## Notes
BR-3 says registry is append-only. This is the creation case — first entry.
