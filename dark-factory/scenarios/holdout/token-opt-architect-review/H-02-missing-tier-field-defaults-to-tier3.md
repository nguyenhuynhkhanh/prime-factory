# Scenario: Spec missing Architect Review Tier field is treated as Tier 3

## Type
edge-case

## Priority
critical -- backward compatibility with all in-flight and pre-feature specs; getting this wrong downgrades review depth silently

## Preconditions
- A spec file exists that was created BEFORE this feature was implemented (no `Architect Review Tier` section)
- The spec touches 7 files and has a populated migration section (if properly classified, it would be Tier 3)
- `implementation-agent.md` has been updated with tier-aware spawn logic

## Action
Implementation-agent reads the pre-existing spec and reaches Step 0c (architect spawn decision).

## Expected Outcome
- Implementation-agent does NOT find an `Architect Review Tier` field in the spec
- Implementation-agent logs: "Architect Review Tier field missing — defaulting to Tier 3 (maximum review)"
- Implementation-agent spawns 3 domain architect-agents in parallel (NOT 1 combined agent)
- Each architect runs 3+ rounds (NOT the reduced Tier 1 or Tier 2 budgets)
- Review quality is identical to pre-feature behavior — no regression

**Secondary test — unrecognized tier value:**
- A spec contains `Architect Review Tier: Tier 4`
- Implementation-agent treats unrecognized value as Tier 3 (strictest default)
- Logs: "Unrecognized tier value 'Tier 4' — defaulting to Tier 3"

**Tertiary test — Unset field:**
- A spec contains `Architect Review Tier: Unset — architect self-assesses`
- Implementation-agent spawns 3 domain architects (treats Unset as Tier 3 for spawn purposes)
- Each architect performs self-assessment during review and records its assessed tier in output

## Notes
Validates BR-4 (missing = Tier 3), EC-1 (missing field), EC-2 (unrecognized value), EC-8 (Unset tier), NFR-5 (backward compatibility). This is holdout because a code-agent that sees it might add explicit backward-compat logic that handles exactly these three cases — we want to verify the general defaulting behavior works without special-casing.
