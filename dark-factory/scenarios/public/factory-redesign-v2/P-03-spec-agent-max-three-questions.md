# Scenario: P-03 — spec-agent instructions cap questions per round at 3

## Type
feature

## Priority
high — more than 3 questions per round degrades developer UX and signals the agent is not converging.

## Preconditions
- `.claude/agents/spec-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/spec-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/spec-agent.md` explicitly caps questions per round. Look for: "at most 3 questions", "maximum 3 questions", "no more than 3 questions per round".

## Expected Outcome
- Assertion passes: file contains an explicit per-round question cap of 3.
- Same assertion passes on plugin mirror.

## Failure Mode (if applicable)
A general "ask clarifying questions" instruction without a numeric cap fails this test. The cap must be explicit.
