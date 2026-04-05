# Scenario: No project profile skips the pre-flight test gate with warning

## Type
edge-case

## Priority
high — projects that skip onboard should not be blocked

## Preconditions
- `dark-factory/project-profile.md` does NOT exist
- A spec exists for `my-feature`

## Action
Developer runs `/df-orchestrate my-feature`

## Expected Outcome
- df-orchestrate looks for project profile
- Not found
- Warns: "No test command found in project profile. Skipping pre-flight test gate."
- Proceeds to architect review without running tests
- No `testGateSkipped` in manifest (this is NOT the same as `--skip-tests`)

## Notes
EC-1 and BR-10. Also covers EC-2 (profile exists but no test command) — same behavior.
