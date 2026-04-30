# Scenario: P-10 — code-agent instructions prohibit asking questions and require BLOCKED result on ambiguity

## Type
feature

## Priority
high — a code-agent that asks questions mid-implementation breaks the one-way handoff model and stalls the pipeline.

## Preconditions
- `.claude/agents/code-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/code-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/code-agent.md` contains:
1. A prohibition on asking questions. Look for: "no questions back", "must not ask questions", "cannot ask questions".
2. A BLOCKED result instruction for unresolvable ambiguity. Look for: "BLOCKED result", "return BLOCKED", "BLOCKED status".

## Expected Outcome
- Both assertions pass.
- Same assertions pass on plugin mirror.

## Failure Mode (if applicable)
A general "if stuck, clarify" instruction fails — it implies question-asking is acceptable. The prohibition must be explicit and the BLOCKED-result path must be named.
