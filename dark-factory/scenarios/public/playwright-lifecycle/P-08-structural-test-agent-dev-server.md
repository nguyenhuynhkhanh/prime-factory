# Scenario: Structural tests verify test-agent dev server management

## Type
feature

## Priority
medium -- dev server management is important for E2E reliability

## Preconditions
- `tests/dark-factory-setup.test.js` exists
- test-agent.md contains dev server management instructions

## Action
Run `node --test tests/dark-factory-setup.test.js` and verify the dev server assertion passes.

## Expected Outcome
- At least 1 test assertion verifies test-agent contains instructions about dev server management for Playwright tests
- Checks for phrases related to server startup, base URL, or server not running

## Notes
Playwright E2E tests require a running dev server. The test-agent must handle this.
