# Scenario: Structural test describe blocks follow naming convention

## Type
edge-case

## Priority
medium -- consistency with existing test patterns

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated with playwright-lifecycle structural tests

## Action
Read `tests/dark-factory-setup.test.js` and verify the new describe blocks follow the naming pattern.

## Expected Outcome
- New describe blocks use the pattern `"playwright-lifecycle -- {agent-name} ..."` or similar descriptive naming
- Test names are descriptive enough to identify what agent/skill and what aspect is being tested
- The pattern is consistent across all new playwright-lifecycle test suites

## Failure Mode
Inconsistent naming makes it harder to identify which tests belong to which feature when debugging failures.

## Notes
BR-4 requires descriptive describe block names. The existing codebase uses patterns like "serena-integration -- ..." for feature-specific test suites.
