# Scenario: Comprehensive final summary report

## Type
feature

## Priority
high -- without a final summary, the developer has no way to understand what happened

## Preconditions
- SKILL.md has been updated with the final summary report section

## Action
Read the updated SKILL.md for the final summary report format.

## Expected Outcome
- The SKILL.md defines a "Final Summary Report" section (or equivalent)
- The summary includes: completed specs with promoted test paths, failed specs with error details and round count, blocked specs with the dependency chain that caused blocking
- The summary includes actionable next steps for failures (e.g., "Re-run with `/df-orchestrate --group X` after fixing spec-b")
- The summary replaces the current "Ask the developer to decide next steps" language in the Failure Handling section

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-6, EC-7, and AC-5.
