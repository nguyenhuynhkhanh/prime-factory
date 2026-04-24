# Scenario: df-cleanup defaults missing testType to "unit"

## Type
feature

## Priority
critical -- backward compatibility with existing promoted-tests.json entries

## Preconditions
- df-cleanup SKILL.md exists at `.claude/skills/df-cleanup/SKILL.md`

## Action
Read df-cleanup SKILL.md and verify it handles missing `testType` gracefully.

## Expected Outcome
- df-cleanup SKILL.md explicitly states that files without a `testType` field default to `"unit"`
- No error or skip behavior for missing `testType`

## Notes
The two existing entries in promoted-tests.json (adaptive-lead-count, token-measurement) lack testType. This scenario ensures they continue to work.
