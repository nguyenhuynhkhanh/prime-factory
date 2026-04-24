# Scenario: implementation-agent.md contains ZERO references to `mode: advisor` except the negation rule

## Type
information-barrier

## Priority
critical — orchestration-layer barrier.

## Preconditions
- implementation-agent.md edited.

## Action
Grep implementation-agent.md (both `.claude/` and `plugins/`) for `mode: advisor` or `"advisor"` or similar.

## Expected Outcome
- The ONLY occurrences are in a NEGATION rule: "NEVER spawn test-agent with `mode: advisor`" (or similar prohibitive phrasing).
- NO positive occurrence — no process step says "spawn test-agent in advisor mode".
- NO code path in implementation-agent's lifecycle conditionally invokes advisor.
- Structural test does `content.match(/mode: advisor/g)` and asserts every match is within a NEVER / NOT / MUST NOT context.

## Notes
Covers FR-21, BR-9, INV-TBD-b. Adversarial grep-based enforcement.
