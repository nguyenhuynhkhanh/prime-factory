# Scenario: --rebuild with no annotations found creates empty registry

## Type
edge-case

## Priority
medium — handles projects with no promoted tests or wiped annotations

## Preconditions
- No files in the codebase contain `// Promoted from Dark Factory holdout:` annotations
- `dark-factory/promoted-tests.json` may or may not exist

## Action
Developer runs `/df-cleanup --rebuild`

## Expected Outcome
- Scans entire codebase for annotation headers
- Finds none
- Reports: "No promoted test annotations found in codebase. Registry will be empty."
- Creates (or overwrites) `dark-factory/promoted-tests.json` with `{ "version": 1, "promotedTests": [] }`

## Notes
This is not an error — it's the correct state for a project that has never promoted tests or whose annotations were removed.
