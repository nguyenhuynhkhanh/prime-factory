# Scenario: H-04 — Layer 0 intent foundation enforces max 20 active decisions

## Type
edge-case

## Priority
high — Layer 0 is always loaded by all agents. Unbounded growth defeats the token-cost control that sharding is designed to achieve.

## Preconditions
- `dark-factory/memory/intent-foundation.md` has been created.
- Architect-agent instructions describe Layer 0 maintenance.

## Action
Structural test performs two checks:
1. Verify `dark-factory/memory/intent-foundation.md` contains documentation of the 20-decision limit (NFR-01). Look for: "maximum 20 decisions", "max 20", "no more than 20 active decisions".
2. Verify the architect-agent file describes what to do when the limit is reached: retire an existing decision or promote the new one to Layer 1 — not silently exceed the cap.

## Expected Outcome
- intent-foundation.md documents the cap.
- architect-agent.md documents the remediation path when the cap is reached.

## Failure Mode (if applicable)
If the cap is stated in one place but not enforced by a documented remediation path, test fails. Documenting a limit without documenting what happens when it's breached is a half-measure.
