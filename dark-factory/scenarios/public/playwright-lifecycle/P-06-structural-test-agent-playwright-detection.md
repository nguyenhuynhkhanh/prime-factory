# Scenario: Structural tests verify test-agent Playwright detection

## Type
feature

## Priority
high -- guards against silent regression of Playwright support

## Preconditions
- `tests/dark-factory-setup.test.js` exists
- test-agent.md contains Playwright detection logic

## Action
Run `node --test tests/dark-factory-setup.test.js` and verify tests pass for test-agent Playwright detection.

## Expected Outcome
- At least 3 test assertions exist verifying test-agent contains:
  - Playwright/E2E detection (checking for `@playwright/test`, `playwright.config`, E2E patterns)
  - Scenario classification by test type (unit vs E2E)
  - E2E test writing instructions (file path pattern, Playwright imports)
- All assertions pass

## Notes
Tests use string-matching against agent content, consistent with the existing 331 structural tests.
