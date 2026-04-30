# Scenario: H-10 — qa-agent instructions prohibit direct codebase access

## Type
edge-case

## Priority
high — QA scenarios should derive from the spec, not from reading the implementation. An implementation-aware QA agent writes tests that pass the current code rather than the intended behavior.

## Preconditions
- `.claude/agents/qa-agent.md` has been created.
- `plugins/dark-factory/agents/qa-agent.md` has been mirrored.

## Action
Structural test verifies that `.claude/agents/qa-agent.md`:
1. Does NOT grant unrestricted codebase access.
2. Lists as inputs: approved spec and Layer 2 ADRs — not the implementation or codebase.
3. Contains an explicit statement that scenarios are derived from the spec, not from reading the code.

## Expected Outcome
- No unrestricted codebase access in QA-agent.
- Spec + ADRs listed as primary inputs.
- Derivation source is explicit: spec, not implementation.

## Failure Mode (if applicable)
If qa-agent.md grants Read/Grep tools without restriction, test fails — even if the prose says "derive from spec". Tool grants override prose intent in practice.
