# Scenario: Tier 2 spec receives 3 domain agents each running 2 rounds minimum

## Type
feature

## Priority
critical -- Tier 2 is the medium-complexity path covering the majority of real specs

## Preconditions
- A spec file exists at `dark-factory/specs/features/medium-feature.spec.md`
- The spec contains: `Architect Review Tier: Tier 2`
- The spec touches 3–4 files with some cross-cutting concerns but no Tier 3 triggers (no migration section, no security domain, no cross-cutting keywords like "all agents" or "system-wide")
- No existing review files exist for `medium-feature`
- `implementation-agent.md` has been updated with tier-aware spawn logic
- `architect-agent.md` has been updated with tiered round budgets

## Action
The implementation-agent reads "Tier 2" from the spec and proceeds to Step 0c.

## Expected Outcome
- Implementation-agent spawns 3 architect-agents in parallel, each with a distinct domain parameter (Security & Data Integrity, Architecture & Performance, API Design & Backward Compatibility)
- Each spawn call includes "Tier 2" as a spawn parameter
- Each architect-agent runs a minimum of 2 rounds (round 1: initial review; round 2: verify spec updates address round 1 findings)
- After round 1, each domain architect writes a round summary to `dark-factory/results/medium-feature/review-{domain}-round1-summary.md`
- At the start of round 2, each architect reads the round 1 summary for its domain before reviewing the updated spec
- Total architect sessions for this review: 6 minimum (3 domains × 2 rounds)

## Notes
Validates FR-3 (Tier 2 spawns 3 agents), FR-4 (2-round minimum), FR-7 (round summary written), FR-8 (summary read at round start). Compare to Tier 3 (P-03) which runs ≥ 3 rounds, and Tier 1 (P-01) which runs 1 round.
