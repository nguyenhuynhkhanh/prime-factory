# Scenario: H-03 — BLOCKED state escalation summary contains all required fields

## Type
edge-case

## Priority
critical — a BLOCKED escalation that only says "process failed" is useless. Developer needs enough context to resume.

## Preconditions
- `.claude/skills/df-orchestrate/SKILL.md` has been updated with BLOCKED state handling.

## Action
Structural test verifies that the df-orchestrate skill file describes the BLOCKED escalation summary as containing:
1. spec_id — which feature is blocked
2. Which gate failed (gate 1/2/3/4 by name)
3. Round count — how many rounds were attempted
4. Last round output — the content of the last attempt (architect notes, drift notes, or test evidence)

All four fields must be described as required in the escalation summary.

## Expected Outcome
- All four required fields are documented.
- BLOCKED is described as a terminal state (no automatic retry after max rounds).

## Failure Mode (if applicable)
If the escalation summary only mentions that the process failed without including the required fields, test fails. Each missing field is a separate failure reason.
