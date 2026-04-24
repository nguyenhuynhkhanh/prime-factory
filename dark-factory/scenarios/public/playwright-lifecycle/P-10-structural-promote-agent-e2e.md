# Scenario: Structural tests verify promote-agent E2E adaptation and testType

## Type
feature

## Priority
critical -- verifies the core schema change is documented in the agent

## Preconditions
- `tests/dark-factory-setup.test.js` exists
- promote-agent.md contains E2E adaptation section and testType in registry schema

## Action
Run `node --test tests/dark-factory-setup.test.js` and verify promote-agent structural tests pass.

## Expected Outcome
- At least 2 test assertions:
  1. promote-agent contains E2E adaptation section (Step 4 or equivalent)
  2. promote-agent registry schema includes `testType` field
- All assertions pass

## Notes
Tests verify both the E2E adaptation instructions AND the registry schema documentation.
