# Scenario: tests/dark-factory-contracts.test.js asserts plugin-mirror parity for all edited files

## Type
feature

## Priority
critical — plugin mirror is the distribution contract.

## Preconditions
- `tests/dark-factory-contracts.test.js` edited per this spec.
- All edits to `.claude/agents/*.md` and `.claude/skills/*/SKILL.md` have been mirrored in `plugins/dark-factory/`.

## Action
Run `node --test tests/dark-factory-contracts.test.js`.

## Expected Outcome
- Mirror parity assertions exist for: `promote-agent.md`, `test-agent.md`, `implementation-agent.md`, `df-intake/SKILL.md`, `df-orchestrate/SKILL.md`, `df-cleanup/SKILL.md`.
- Each assertion compares byte-for-byte between `.claude/` and `plugins/dark-factory/`.
- All assertions pass.

## Notes
Covers FR-31, BR-7 (foundation). Contract tests are the enforcement mechanism for the dual-write requirement.
