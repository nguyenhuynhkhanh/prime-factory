# Scenario: implementation-agent.md contains hard rule — NEVER spawn test-agent in advisor mode

## Type
feature

## Priority
critical — orchestration-layer enforcement of mode isolation.

## Preconditions
- implementation-agent.md edited per this spec.

## Action
Read implementation-agent.md.

## Expected Outcome
- File contains the explicit phrase "NEVER spawn test-agent with `mode: advisor`" (or close semantic equivalent).
- The rule appears in the Constraints / Information Barrier section.
- No other part of implementation-agent.md contains `mode: advisor` (e.g., in process steps) — advisor-spawn is a hard exclusion.

## Notes
Covers FR-21, BR-9. Test asserts both the rule phrase exists AND the file contains no counter-examples.
