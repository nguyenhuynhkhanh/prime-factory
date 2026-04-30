# Scenario: P-02 — spec-agent instructions require draft-first iterative approach

## Type
feature

## Priority
critical — without draft-first, the spec-agent returns to a black-box long-pass model that fails the "acts as task tracker" goal.

## Preconditions
- `.claude/agents/spec-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/spec-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/spec-agent.md` describes the draft-first loop: produce a partial draft immediately on first input, show it to the developer, ask clarifying questions, update in place. Look for: "draft immediately", "partial draft", "update in place", "is this right" — any phrasing that captures the immediate-draft-then-refine pattern.

## Expected Outcome
- Assertion passes: file contains draft-first loop description.
- Same assertion passes on plugin mirror.
- Test run reports no failures in the factory-redesign-v2 block.

## Failure Mode (if applicable)
If the file only describes producing a complete spec (no iterative loop), test fails. The draft-first behavior is the distinguishing feature — its absence is a regression.
