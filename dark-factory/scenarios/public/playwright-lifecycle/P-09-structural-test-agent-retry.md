# Scenario: Structural tests verify test-agent retry/flakiness handling

## Type
feature

## Priority
medium -- E2E tests are inherently flaky; retry handling is essential

## Preconditions
- `tests/dark-factory-setup.test.js` exists
- test-agent.md contains retry/flakiness handling instructions

## Action
Run `node --test tests/dark-factory-setup.test.js` and verify the retry/flakiness assertion passes.

## Expected Outcome
- At least 1 test assertion verifies test-agent contains instructions about retry or flakiness handling for Playwright tests
- Checks for relevant phrases like "retry", "flak", or "timeout"

## Notes
This guards the test-agent's E2E reliability instructions against regression.
