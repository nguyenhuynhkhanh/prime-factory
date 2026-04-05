# Scenario: Project profile exists but Testing section has no Run command

## Type
edge-case

## Priority
high — partial profiles are common

## Preconditions
- `dark-factory/project-profile.md` exists
- The Testing section exists but the `Run:` field is missing or empty

## Action
Developer runs `/df-orchestrate my-feature`

## Expected Outcome
- df-orchestrate reads the project profile
- Parses the Testing section
- No test command found
- Warns: "No test command found in project profile. Skipping pre-flight test gate."
- Proceeds to architect review without running tests
- No `testGateSkipped` field in manifest (the gate was not "skipped" — it was "not applicable")

## Notes
EC-2: This is distinct from EC-1 (no profile at all). Same outcome but different detection path.
