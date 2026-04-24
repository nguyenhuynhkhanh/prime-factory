# Scenario: Structural tests verify test-agent E2E test running instructions

## Type
feature

## Priority
high -- ensures test-agent knows how to execute Playwright tests

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated with playwright-lifecycle structural tests
- test-agent.md contains E2E test running instructions

## Action
Run `node --test tests/dark-factory-setup.test.js` and check for a test assertion that verifies test-agent contains Playwright test execution command.

## Expected Outcome
- A structural test assertion verifies test-agent.md contains `npx playwright test` or equivalent Playwright execution command
- The assertion is within a describe block related to playwright-lifecycle

## Notes
This is separate from detection (P-06) -- this specifically tests the E2E test RUNNING instructions, not just detection of Playwright in the project.
