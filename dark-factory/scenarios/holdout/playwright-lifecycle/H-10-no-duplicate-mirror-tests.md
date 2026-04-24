# Scenario: No duplicate plugin mirror tests for already-covered files

## Type
edge-case

## Priority
medium -- prevents test bloat

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated with playwright-lifecycle changes
- Existing mirror consistency tests may already cover promote-agent.md and df-cleanup SKILL.md

## Action
Read `tests/dark-factory-setup.test.js` and check whether existing plugin mirror tests already cover promote-agent.md and df-cleanup SKILL.md.

## Expected Outcome
- If existing mirror tests already verify `plugins/dark-factory/agents/promote-agent.md` matches `.claude/agents/promote-agent.md`, no new mirror test is added for this file
- If existing mirror tests already verify `plugins/dark-factory/skills/df-cleanup/SKILL.md` matches `.claude/skills/df-cleanup/SKILL.md`, no new mirror test is added for this file
- New mirror tests are only added for files NOT already covered

## Failure Mode
Duplicate mirror tests add no value and make the test suite harder to maintain.

## Notes
The existing test suite has a comprehensive plugin mirror section. The code-agent should check it before adding new mirror assertions.
