# Scenario: df-cleanup uses npx playwright test for E2E files

## Type
feature

## Priority
high -- verifies correct runner is specified

## Preconditions
- df-cleanup SKILL.md exists at `.claude/skills/df-cleanup/SKILL.md`

## Action
Read df-cleanup SKILL.md and verify the E2E partition uses the correct Playwright command.

## Expected Outcome
- df-cleanup SKILL.md contains `npx playwright test` as the command for E2E test files
- The command includes the file path(s) for targeted execution

## Notes
This is a structural test verifying skill content.
