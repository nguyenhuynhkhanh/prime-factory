# Scenario: All changes are mirrored to plugins directory

## Type
feature

## Priority
critical -- the plugins directory is the distribution copy

## Preconditions
- Agent files exist in both `.claude/agents/` and `plugins/dark-factory/agents/`
- Skill files exist in both `.claude/skills/` and `plugins/dark-factory/skills/`

## Action
For each file modified by this feature, compare the `.claude/` version with the `plugins/dark-factory/` version.

## Expected Outcome
- `.claude/agents/onboard-agent.md` is identical to `plugins/dark-factory/agents/onboard-agent.md`
- `.claude/agents/spec-agent.md` is identical to `plugins/dark-factory/agents/spec-agent.md`
- `.claude/agents/code-agent.md` is identical to `plugins/dark-factory/agents/code-agent.md`
- `.claude/agents/test-agent.md` is identical to `plugins/dark-factory/agents/test-agent.md`
- `.claude/agents/promote-agent.md` is identical to `plugins/dark-factory/agents/promote-agent.md`
- `.claude/agents/architect-agent.md` is identical to `plugins/dark-factory/agents/architect-agent.md`
- `.claude/agents/debug-agent.md` is identical to `plugins/dark-factory/agents/debug-agent.md`
- `.claude/skills/df-intake/SKILL.md` is identical to `plugins/dark-factory/skills/df-intake/SKILL.md`
- `.claude/skills/df-debug/SKILL.md` is identical to `plugins/dark-factory/skills/df-debug/SKILL.md`

## Notes
The architect-agent and debug-agent currently have pre-existing drift between .claude/ and plugins/. This feature must resolve that drift by copying the updated .claude/ version to plugins/.
