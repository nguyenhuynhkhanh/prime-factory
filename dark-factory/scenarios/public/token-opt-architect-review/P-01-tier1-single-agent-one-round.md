# Scenario: Tier 1 spec receives 1 combined architect agent for 1 round

## Type
feature

## Priority
critical -- this is the primary token savings path; incorrect spawn count negates the entire optimization

## Preconditions
- A spec file exists at `dark-factory/specs/features/simple-feature.spec.md`
- The spec contains: `Architect Review Tier: Tier 1`
- The spec touches ≤ 2 files, has no migration section, no security/auth domain signals, no cross-cutting keywords
- No existing review files exist for `simple-feature`
- `implementation-agent.md` has been updated with tier-aware spawn logic

## Action
The implementation-agent reads the spec's `Architect Review Tier` field and proceeds to Step 0c (parallel domain review).

## Expected Outcome
- Implementation-agent reads "Tier 1" from the spec
- Implementation-agent spawns exactly 1 architect-agent (NOT 3 domain agents)
- The spawned architect-agent receives NO domain parameter
- The spawn call includes the tier value ("Tier 1") as a parameter
- The architect-agent performs a combined review covering all three domains (Security & Data Integrity, Architecture & Performance, API Design & Backward Compatibility) in a single session
- The architect-agent runs exactly 1 round minimum (no mandatory second or third round)
- The architect produces a single `simple-feature.review.md` file (not domain-specific `.review-security.md` etc.)
- Total architect sessions for this review: 1

## Notes
Validates FR-3 (Tier 1 spawn), FR-4 (1-round budget), FR-10 (combined agent covers all domains). The key assertion is that the implementation-agent does not spawn 3 agents — it spawns exactly 1 combined architect.
