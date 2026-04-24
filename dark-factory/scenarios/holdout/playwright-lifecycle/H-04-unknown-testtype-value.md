# Scenario: Unknown testType value defaults to unit with warning

## Type
edge-case

## Priority
medium -- forward compatibility for future test types

## Preconditions
- df-cleanup SKILL.md has been updated with E2E-aware partitioning

## Action
Read df-cleanup SKILL.md and verify it handles unknown `testType` values.

## Expected Outcome
- df-cleanup SKILL.md states that unknown `testType` values (anything other than `"unit"` or `"e2e"`) should produce a warning and default to `"unit"`
- The warning text references the unknown value so the developer can investigate

## Failure Mode
An unknown testType could cause df-cleanup to crash or silently skip the file.

## Notes
This future-proofs the implementation. If a new test type is added to promote-agent but df-cleanup is not updated, the health check should degrade gracefully rather than break.
