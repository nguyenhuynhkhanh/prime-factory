# Scenario: Empty string testType treated as unit

## Type
edge-case

## Priority
medium -- defensive handling of malformed data

## Preconditions
- df-cleanup SKILL.md has been updated with E2E-aware partitioning

## Action
Read df-cleanup SKILL.md and verify it handles empty or absent `testType` uniformly.

## Expected Outcome
- df-cleanup SKILL.md states that files with missing OR empty `testType` default to `"unit"`
- The language covers both "absent" and "empty" cases (not just absent)

## Failure Mode
An empty string testType could fall through both "unit" and "e2e" branches, causing the file to be skipped entirely during health check.

## Notes
This is a robustness edge case. The promote-agent should never produce an empty testType, but df-cleanup must handle it defensively.
