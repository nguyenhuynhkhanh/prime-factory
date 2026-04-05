# Scenario: --skip-tests is logged even when tests would have passed

## Type
edge-case

## Priority
medium — the flag should always be auditable regardless of test state

## Preconditions
- Project's test suite is green (all pass)
- A spec exists for `my-feature`

## Action
Developer runs `/df-orchestrate my-feature --skip-tests`

## Expected Outcome
- Tests are NOT run (even though they would pass)
- `"testGateSkipped": true` is still recorded in manifest
- `"testGateSkippedAt"` timestamp is recorded
- Architect review proceeds normally

## Notes
The skip flag is about intent, not outcome. It signals "I chose to skip" regardless of whether the skip was necessary.
