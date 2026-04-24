# Scenario: df-cleanup partitions test execution by testType

## Type
feature

## Priority
critical -- the main behavioral change in df-cleanup

## Preconditions
- df-cleanup SKILL.md exists at `.claude/skills/df-cleanup/SKILL.md`

## Action
Read df-cleanup SKILL.md and verify Step 2c.4 describes partitioned test execution.

## Expected Outcome
- df-cleanup SKILL.md contains instructions to partition promoted test files by `testType`
- Unit tests are run with the project's test command
- E2E tests are run with `npx playwright test`
- The two partitions are executed separately

## Notes
This is a structural test verifying skill content.
