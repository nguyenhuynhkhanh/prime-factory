# Scenario: promote-agent includes testType "e2e" for Playwright test files

## Type
feature

## Priority
critical -- ensures E2E tests are distinguishable from unit tests in the registry

## Preconditions
- promote-agent.md exists at `.claude/agents/promote-agent.md`

## Action
Read promote-agent.md and verify it instructs setting `"testType": "e2e"` for Playwright/E2E test files.

## Expected Outcome
- promote-agent.md contains instruction text specifying `"testType": "e2e"` for Playwright E2E test files
- The instruction distinguishes E2E files (placed in E2E directories or with `.e2e.spec.` naming) from unit files

## Notes
This is a structural test verifying agent content.
