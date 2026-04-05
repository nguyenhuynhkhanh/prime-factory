# Scenario: --rebuild reconstructs registry from annotation headers

## Type
feature

## Priority
high — recovery path when registry is lost or corrupted

## Preconditions
- `dark-factory/promoted-tests.json` does NOT exist (was deleted or never created)
- Two test files in the project have annotation headers:
  - `tests/user-auth.promoted.test.js` with `// Promoted from Dark Factory holdout: user-auth`
  - `tests/auth/auth.test.js` with `// Promoted from Dark Factory holdout: login-fix` (inside section markers)

## Action
Developer runs `/df-cleanup --rebuild`

## Expected Outcome
- Scans codebase for files containing `// Promoted from Dark Factory holdout:` 
- Finds both files
- Creates `dark-factory/promoted-tests.json` with 2 entries
- Each entry has the feature name extracted from the annotation
- Fields that cannot be derived (e.g., `holdoutScenarioCount`) are set to `null`
- For the co-located file, detects section markers and sets `"sectionMarkers": true`
- Reports: "Rebuilt registry with 2 promoted test entries"

## Notes
BR-8: Atomic overwrite — the entire registry is replaced. Developer is shown the result before confirming.
