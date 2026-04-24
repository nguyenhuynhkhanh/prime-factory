# Scenario: Tier 1 architect discovers a blocker in round 1 and self-escalates to additional rounds

## Type
edge-case

## Priority
critical -- if a Tier 1 architect cannot escalate, its 1-round budget becomes a ceiling rather than a floor, allowing real blockers to slip through

## Preconditions
- A spec is classified as Tier 1 (≤ 2 files, no migration, no security signals)
- The Tier 1 combined architect is spawned (1 agent, 1-round budget)
- During review, the architect discovers an unexpected issue: the "simple" change actually modifies a shared template referenced by 6 other agents — a cross-cutting concern that was missed during spec classification
- This constitutes a blocker: the impact surface is much larger than the spec acknowledged

## Action
The Tier 1 combined architect completes its initial round 1 review and identifies the blocker.

## Expected Outcome
- Architect does NOT silently approve despite the blocker (the 1-round budget is a floor, not a ceiling)
- Architect documents escalation in its review output: "Escalated from Tier 1 to Tier 2: discovered shared template dependency not visible from file count alone — actual blast radius spans 6 agent files"
- Architect writes round 1 summary to `dark-factory/results/{name}/review-combined-round1-summary.md`
- The summary's "Open blockers" section contains the escalation reason
- Architect proceeds with at least one additional round (round 2) — spawns spec-agent with blockers, reads updated spec, re-evaluates
- Implementation-agent reads the escalation note from the review output and records in manifest: `"tierEscalation": { "from": 1, "to": 2, "reason": "shared template dependency" }`
- Total sessions: more than 1 (the single-round Tier 1 budget was a floor, escalation added rounds)

## Notes
Validates FR-9 (escalation protocol), BR-2 (tier is floor not ceiling), EC-3 (Tier 1 escalates on blocker), EC-9 (mid-review escalation recorded). This is a holdout scenario because a code-agent that sees it might hard-code escalation logic; we want to verify the architect's behavioral instructions produce correct escalation organically.
