# Scenario: Single feature entry with mixed unit and E2E files

## Type
edge-case

## Priority
critical -- validates the core design decision that testType is per-file

## Preconditions
- promote-agent.md has been updated with testType field
- df-cleanup SKILL.md has been updated with E2E-aware partitioning

## Action
1. Read promote-agent.md and verify the `files` array supports mixed types within a single entry
2. Read df-cleanup SKILL.md and verify partitioning happens at the file level, not the entry level

## Expected Outcome
- promote-agent.md shows that `testType` is on each file object, not on the parent entry
- df-cleanup SKILL.md partitions by iterating files across ALL entries, not by treating each entry as a single type
- A feature that promoted both `holdout-tests.test.js` (unit) and `holdout-e2e.spec.js` (E2E) would have both files in one entry with different testType values
- df-cleanup would run the unit file with the project test runner and the E2E file with Playwright

## Failure Mode
If testType were per-entry instead of per-file, a mixed promotion would either run all files as unit tests (missing E2E coverage) or all as E2E (failing unit tests in Playwright).

## Notes
This is the most important design validation. BR-1 explicitly requires per-file testType.
