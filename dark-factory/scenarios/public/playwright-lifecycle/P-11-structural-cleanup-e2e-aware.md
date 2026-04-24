# Scenario: Structural tests verify df-cleanup E2E-aware health check

## Type
feature

## Priority
critical -- verifies df-cleanup can differentiate test types

## Preconditions
- `tests/dark-factory-setup.test.js` exists
- df-cleanup SKILL.md contains E2E-aware health check logic

## Action
Run `node --test tests/dark-factory-setup.test.js` and verify df-cleanup structural tests pass.

## Expected Outcome
- At least 2 test assertions:
  1. df-cleanup contains `testType` awareness (partitioned execution)
  2. df-cleanup references `npx playwright test` for E2E tests
- All assertions pass

## Notes
Tests use string-matching against df-cleanup SKILL.md content.
