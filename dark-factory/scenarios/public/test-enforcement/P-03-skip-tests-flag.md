# Scenario: --skip-tests bypasses the pre-flight gate and logs to manifest

## Type
feature

## Priority
high — the bypass mechanism must work AND be auditable

## Preconditions
- `dark-factory/project-profile.md` exists with a valid test command
- A spec exists for `my-feature`
- The project's test suite has failing tests

## Action
Developer runs `/df-orchestrate my-feature --skip-tests`

## Expected Outcome
- df-orchestrate does NOT run the project's test suite
- df-orchestrate logs a warning: test gate was skipped
- Manifest entry for `my-feature` includes `"testGateSkipped": true` and `"testGateSkippedAt"` with an ISO 8601 timestamp
- df-orchestrate proceeds to architect review normally

## Notes
BR-2 requires this to be logged. The timestamp enables teams to audit when gates were skipped.
