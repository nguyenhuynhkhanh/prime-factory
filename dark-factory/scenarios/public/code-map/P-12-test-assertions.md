# Scenario: Test file asserts code map generation and consumption instructions

## Type
feature

## Priority
critical -- tests guard structural invariants; without assertions, future changes can silently break the feature

## Preconditions
- tests/dark-factory-setup.test.js exists with the current test structure
- Code map feature has been implemented

## Action
Run `node --test tests/dark-factory-setup.test.js` after implementation.

## Expected Outcome
- New test block "Code map" (or similar) passes, asserting:
  - onboard-agent.md contains "Code Map" or "code-map" (generation instructions exist)
  - onboard-agent.md contains scanner/parallel scanning language
  - onboard-agent.md write targets include "code-map.md"
  - spec-agent.md references "code-map.md"
  - architect-agent.md references "code-map.md"
  - code-agent.md references "code-map.md"
  - debug-agent.md references "code-map.md"
  - test-agent.md references "code-map.md"
  - promote-agent.md references "code-map.md"
  - df-intake SKILL.md mentions "code-map" in context of lead prompts
  - df-debug SKILL.md mentions "code-map" in context of investigator prompts
- All plugin mirror tests pass (existing + new pairs)
- All existing tests still pass (no regression)

## Notes
Validates FR-13. Follow the existing test pattern of string includes/matches on file content using node:test and node:assert/strict.
