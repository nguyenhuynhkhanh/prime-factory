# Scenario: All updated agent and template files are correctly mirrored to plugins/

## Type
feature

## Priority
critical -- plugin mirror consistency is enforced by the contracts test; out-of-sync mirrors cause test failures and incorrect distribution

## Preconditions
- All 4 source files have been updated: `.claude/agents/architect-agent.md`, `.claude/agents/implementation-agent.md`, `.claude/agents/spec-agent.md`, `dark-factory/templates/spec-template.md`
- Plugin mirror files exist at `plugins/dark-factory/agents/` and `plugins/dark-factory/templates/`

## Action
Run `node --test tests/dark-factory-contracts.test.js` to verify plugin mirror consistency.

## Expected Outcome
- `plugins/dark-factory/agents/architect-agent.md` has identical content to `.claude/agents/architect-agent.md`
- `plugins/dark-factory/agents/implementation-agent.md` has identical content to `.claude/agents/implementation-agent.md`
- `plugins/dark-factory/agents/spec-agent.md` has identical content to `.claude/agents/spec-agent.md`
- `plugins/dark-factory/templates/spec-template.md` has identical content to `dark-factory/templates/spec-template.md`
- All existing plugin mirror tests pass (no regressions)
- Byte-for-byte match (no trailing whitespace differences, no encoding differences)

## Notes
Validates AC-9 (plugin mirrors), EC-10 (mirror out of sync causes test failure). The contracts test does exact string comparison, not semantic comparison — even a trailing newline difference will fail the test. The code-agent must write identical content to both locations.
