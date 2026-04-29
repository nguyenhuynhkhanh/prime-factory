# Scenario: findings file write precedes code-agent spawn — ordering rule present in source

## Type
feature

## Priority
critical — race condition prevention: if code-agent starts before findings file exists, self-load silently gets empty findings instead of the actual architect decisions.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.

## Action
Read `src/agents/implementation-agent.src.md`. Identify the sequence of operations in Step 0d and Step 1.

## Expected Outcome
- In the source file, Step 0d (or a sub-step of Step 0d) explicitly states the findings file is written BEFORE code-agent is spawned.
- The prose makes clear this ordering is mandatory (e.g., "This file must be written before code-agent is spawned" or equivalent).
- Step 1 (code-agent spawn) references the findings file via the `architectFindingsPath` parameter — it does not re-read or re-synthesize findings at spawn time.

## Notes
Validates BR-3, FR-1. The ordering rule must be present in prose, not just implied by the section sequence, because implementation-agent is an AI agent operating from prose instructions.
