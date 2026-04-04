# Scenario: Tests verify test-agent and promote-agent profile references

## Type
feature

## Priority
high -- ensures the critical gap fix is permanently enforced

## Preconditions
- The test file exists at `tests/dark-factory-setup.test.js`
- The existing test "all key agents reference project-profile.md" currently checks only spec-agent, debug-agent, architect-agent, and code-agent

## Action
Read the test file and verify it includes assertions for test-agent and promote-agent profile references.

## Expected Outcome
- The test file includes assertions that test-agent references project-profile.md
- The test file includes assertions that promote-agent references project-profile.md
- At least one assertion checks for section-specific language in the test-agent (not just "project-profile.md" but evidence of section targeting, e.g., "Testing" section reference)
- At least one assertion checks for section-specific language in the promote-agent
- All existing tests still pass

## Notes
The existing test at lines 452-460 iterates over ["spec-agent", "debug-agent", "architect-agent", "code-agent"]. The simplest approach is to add "test-agent" and "promote-agent" to this list, plus add new specific tests for section targeting.
