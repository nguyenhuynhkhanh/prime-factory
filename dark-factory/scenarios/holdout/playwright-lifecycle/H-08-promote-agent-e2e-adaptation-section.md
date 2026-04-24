# Scenario: Structural tests verify promote-agent has dedicated E2E adaptation section

## Type
feature

## Priority
high -- ensures promote-agent handles E2E tests differently from unit tests

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated with playwright-lifecycle structural tests
- promote-agent.md contains a section for adapting Playwright E2E tests

## Action
Run `node --test tests/dark-factory-setup.test.js` and check for a test assertion that verifies promote-agent has E2E-specific adaptation instructions.

## Expected Outcome
- A structural test assertion verifies promote-agent.md contains E2E adaptation content (Step 4 or equivalent)
- The assertion checks for Playwright-specific adaptation phrases (e.g., "E2E tests", "Playwright", "base URL", "fixture")
- This is distinct from the testType registry assertion (P-10) -- this tests the adaptation PROCESS, not the registry SCHEMA

## Notes
The promote-agent has both "Adapt Playwright E2E Tests" (Step 4) and "Update Registry" (Step 7). Both need separate structural test coverage.
