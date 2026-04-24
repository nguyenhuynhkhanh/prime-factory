# Scenario: Plugin mirrors match source for promote-agent and df-cleanup

## Type
feature

## Priority
critical -- plugin distribution must stay in sync

## Preconditions
- `.claude/agents/promote-agent.md` has been updated with testType changes
- `.claude/skills/df-cleanup/SKILL.md` has been updated with E2E partitioning
- `plugins/dark-factory/agents/promote-agent.md` exists
- `plugins/dark-factory/skills/df-cleanup/SKILL.md` exists

## Action
1. Read `.claude/agents/promote-agent.md` and `plugins/dark-factory/agents/promote-agent.md` -- compare content
2. Read `.claude/skills/df-cleanup/SKILL.md` and `plugins/dark-factory/skills/df-cleanup/SKILL.md` -- compare content

## Expected Outcome
- promote-agent.md source and plugin are byte-identical
- df-cleanup SKILL.md source and plugin are byte-identical
- Structural mirror tests pass in `node --test tests/`

## Notes
Existing mirror consistency tests in the test suite may already cover these files. If not, new mirror tests should be added. The code-agent should check whether existing mirror tests cover these specific files before adding duplicates.
