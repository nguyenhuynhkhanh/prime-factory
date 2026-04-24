# Scenario: Structural tests verify test-agent backend-only exclusion

## Type
feature

## Priority
high -- ensures backend-only scenarios are not tested with Playwright

## Preconditions
- `tests/dark-factory-setup.test.js` exists
- test-agent.md contains backend-only exclusion logic

## Action
Run `node --test tests/dark-factory-setup.test.js` and verify the backend-only exclusion assertion passes.

## Expected Outcome
- At least 1 test assertion verifies test-agent contains logic to exclude backend-only scenarios from E2E testing
- The assertion checks for relevant phrases like "without a browser", "backend", or "API" in the classification criteria

## Notes
Backend-only exclusion means scenarios that test pure logic/API behavior are classified as unit tests even if Playwright is installed.
