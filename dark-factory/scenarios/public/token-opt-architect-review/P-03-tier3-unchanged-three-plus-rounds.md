# Scenario: Tier 3 spec receives unchanged 3-domain review with 3+ round minimum

## Type
feature

## Priority
critical -- Tier 3 is the safety floor for complex specs; regression here would be catastrophic

## Preconditions
- A spec file exists at `dark-factory/specs/features/complex-feature.spec.md`
- The spec contains: `Architect Review Tier: Tier 3`
- The spec has a populated migration section AND touches 5+ files AND contains cross-cutting keyword "all agents"
- No existing review files exist for `complex-feature`
- `implementation-agent.md` has been updated with tier-aware spawn logic

## Action
The implementation-agent reads "Tier 3" from the spec and proceeds to Step 0c.

## Expected Outcome
- Implementation-agent spawns 3 architect-agents in parallel with domain parameters (same as current behavior before this feature)
- Each spawn call includes "Tier 3" as a spawn parameter
- Each architect-agent runs a minimum of 3 rounds (round 1: architecture & security, round 2: production readiness & migration, round 3: completeness & edge cases)
- After round 2 (and any subsequent rounds), each domain architect writes round summary notes
- At the start of rounds 2 and 3+, each architect reads the prior round's summary
- The strictest-wins synthesis logic applies exactly as it does today
- The architect BLOCKS or APPROVES at the same quality bar as before this feature was introduced
- Total architect sessions for this review: 9 minimum (3 domains × 3 rounds), with additional rounds if blockers persist

## Notes
Validates FR-3 (Tier 3 behavior unchanged), FR-4 (Tier 3 ≥ 3 rounds preserved). This is a regression test as much as a feature test — Tier 3 behavior must be identical to the pre-feature implementation, plus the addition of round summaries. No reduction in review depth is acceptable.
