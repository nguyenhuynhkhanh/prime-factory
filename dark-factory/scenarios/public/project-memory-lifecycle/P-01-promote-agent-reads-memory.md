# Scenario: promote-agent reads all three memory files at start of promotion

## Type
feature

## Priority
critical — foundational write-protocol requirement; every promotion begins with a read.

## Preconditions
- `dark-factory/memory/invariants.md`, `decisions.md`, `ledger.md` exist.
- A feature spec has been implemented and holdout validation has passed.
- `.claude/agents/promote-agent.md` has been edited per this spec.

## Action
Read `.claude/agents/promote-agent.md` (the edited version).

## Expected Outcome
- The agent's documented process includes an explicit step (named "Read Memory" or equivalent) that reads all three files: `dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, `dark-factory/memory/ledger.md`.
- The step is placed BEFORE the ID-assignment step.
- The agent documents that the read happens at commit time (BR-11 — not cached from start of run).

## Notes
Structural/documentation assertion. No runtime execution needed — validates the agent's prompt describes the correct behavior.
