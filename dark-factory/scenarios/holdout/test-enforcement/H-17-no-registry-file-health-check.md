# Scenario: Health check when promoted-tests.json does not exist

## Type
edge-case

## Priority
medium — projects that never promoted should not error

## Preconditions
- `dark-factory/promoted-tests.json` does NOT exist
- `dark-factory/manifest.json` exists (project is set up)

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check looks for `dark-factory/promoted-tests.json`
- File not found
- Reports: "No promoted test registry found. No promoted tests to check."
- Does NOT error or crash
- Continues to normal df-cleanup behavior (manifest scan for stuck/stale features)

## Notes
BR-9: Zero promoted tests is handled gracefully. Distinct from P-16 (file exists but empty array) — this is the "file doesn't exist" case.
