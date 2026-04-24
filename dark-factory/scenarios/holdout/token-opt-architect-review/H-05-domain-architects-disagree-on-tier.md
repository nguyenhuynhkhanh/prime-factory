# Scenario: Strictest-wins when domain architects self-assess different tiers

## Type
edge-case

## Priority
high -- if strictest-wins is not enforced, a disagreement on tier can silently downgrade the review to an insufficient depth

## Preconditions
- A spec is recorded as Tier 2 by the spec-agent
- The implementation-agent spawns 3 domain architects in parallel with "Tier 2" as the spawn parameter
- The Security architect self-assesses the spec and agrees: "Confirmed Tier 2 — no auth changes, no sensitive data"
- The Architecture architect self-assesses: "Escalating to Tier 3 — the spec's 'some cross-cutting concerns' include a change to the shared implementation-agent event emission pattern, which is a system-wide concern"
- The API architect self-assesses: "Confirmed Tier 2 — API surface is small"

## Action
Implementation-agent collects the three domain assessments and synthesizes them using strictest-wins logic.

## Expected Outcome
- The Architecture domain's Tier 3 self-assessment prevails
- Overall tier is elevated to Tier 3 for all subsequent rounds
- All three domain architects run 3+ rounds (not just 2), matching the Tier 3 minimum
- Implementation-agent's synthesized review records the tier disagreement and the strictest-wins resolution:
  - "Security assessed Tier 2, Architecture escalated to Tier 3, API assessed Tier 2. Strictest-wins: all domains running at Tier 3 depth."
- The escalation is recorded in the manifest: `"tierEscalation": { "from": 2, "to": 3, "reason": "Architecture domain: shared implementation-agent event emission pattern is a system-wide concern" }`
- The developer is NOT prompted for input (strictest-wins is automatic, not a question)

## Notes
Validates FR-5 (self-assessment and strictest-wins), BR-3 (strictest-wins for domain disagreement), EC-6 (domain tier disagreement). Holdout because a code-agent that sees this might only handle the case where all domains agree, missing the disagreement handling path.
