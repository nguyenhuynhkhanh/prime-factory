# Scenario: Entry with all E2E files and no unit files

## Type
edge-case

## Priority
high -- ensures partitioned execution handles single-type entries

## Preconditions
- df-cleanup SKILL.md has been updated with E2E-aware partitioning
- A hypothetical promoted entry has all files with `"testType": "e2e"` and none with `"unit"`

## Action
Read df-cleanup SKILL.md and verify the partitioned execution logic does not require both types to be present.

## Expected Outcome
- df-cleanup SKILL.md describes running each partition separately
- The language does not assume both partitions will have files
- Only the E2E runner would be invoked for an all-E2E entry

## Failure Mode
If df-cleanup constructs a unit test command with zero file paths, it could run ALL tests in the project or error with "no test files specified."

## Notes
This scenario tests the logical completeness of the partitioning instruction. The code-agent should ensure the implementation only runs a partition if it has files.
