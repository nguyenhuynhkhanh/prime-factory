# Scenario: P-14 — all modified agent and skill files are mirrored to plugins/dark-factory/

## Type
feature

## Priority
critical — plugin mirror parity is enforced by existing tests. This scenario specifically checks the new files introduced by this feature.

## Preconditions
- All agent and skill files modified or created by this feature have been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify byte-for-byte parity between source and plugin mirror for:
- `.claude/agents/spec-agent.md` vs `plugins/dark-factory/agents/spec-agent.md`
- `.claude/agents/architect-agent.md` vs `plugins/dark-factory/agents/architect-agent.md`
- `.claude/agents/qa-agent.md` vs `plugins/dark-factory/agents/qa-agent.md`
- `.claude/agents/code-agent.md` vs `plugins/dark-factory/agents/code-agent.md`
- `.claude/skills/df-orchestrate/SKILL.md` vs `plugins/dark-factory/skills/df-orchestrate/SKILL.md`
- `.claude/skills/df-intake/SKILL.md` vs `plugins/dark-factory/skills/df-intake/SKILL.md`

## Expected Outcome
- All 6 parity assertions pass.
- Test run reports no failures in the factory-redesign-v2 block.

## Failure Mode (if applicable)
Any parity mismatch fails and must identify which file pair diverged. No partial credit — all mirrors must be in sync.
