# Scenario: Advisor surfaces missing coverage by invariant ID

## Type
edge-case

## Priority
medium — helps spec-agent fill coverage gaps.

## Preconditions
- Spec declares `## Invariants > Modifies > INV-0003`.
- Draft scenarios do NOT include any test that exercises INV-0003's behavior.
- test-agent.md edited with advisor mode.

## Action
spec-agent spawns advisor.

## Expected Outcome
- Advisor's `missing` output field: `[INV-0003]`.
- Advisor does NOT include any prose describing what INV-0003 requires (that would be a leak vector; just the ID pointer is sufficient).
- spec-agent reads the `missing` category; may add a scenario; is NOT obligated to.

## Notes
Covers EC-14. Adversarial — naive advisor might try to explain WHY INV-0003 is uncovered with free-form prose; structural barrier prevents this (H-14).
