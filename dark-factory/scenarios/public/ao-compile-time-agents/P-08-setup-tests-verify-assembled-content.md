# Scenario: P-08 — Setup tests verify assembled header and context-loading content

## Type
feature

## Priority
high — validates the specific setup-test additions for this feature

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated with:
  - A test that asserts each assembled output file contains the auto-generated header comment
  - A test that asserts each agent using `shared/context-loading.md` contains the resolved canonical text
- Build has run; all agents are assembled

## Action
Run `npm test`.

## Expected Outcome
- The "auto-generated header" test passes for all 9 agents
- The "context-loading content" test passes for: spec-agent, debug-agent, architect-agent, promote-agent, test-agent, code-agent
- All existing tests continue to pass (no regression from the new setup-test additions)

## Failure Mode (if applicable)
If the build produced an output file without the header comment, the setup test catches it.

## Notes
Exercises FR-10, AC-3, AC-9, and AC-17. The setup test additions mirror the pattern of existing content-verification tests in `dark-factory-setup.test.js`.
