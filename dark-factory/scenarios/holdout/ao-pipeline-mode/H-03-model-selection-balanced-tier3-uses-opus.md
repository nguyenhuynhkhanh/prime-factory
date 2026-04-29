# Scenario: H-03 — Balanced mode selects Opus for Tier 3 specs

## Type
edge-case

## Priority
high — FR-5. The balanced mode's tier-conditional selection is the most complex cell in the table. Tier 3 specs must get Opus in balanced mode — not Sonnet — even though balanced is the "default" mode.

## Preconditions
- `implementation-agent.md` updated with model selection table.
- Spec under test has `Architect Review Tier: Tier 3`.
- `--mode balanced` (or omitted, since balanced is default).

## Action
Structural test verifies that `implementation-agent.md` explicitly documents the balanced mode's tier-3 exception:
1. The file documents "balanced → Sonnet for Tier 1/2" (or equivalent).
2. The file documents "balanced → Opus for Tier 3" (or equivalent).
3. These two rules appear as distinct lines or cells in the model selection table — not as a single "balanced → Sonnet" rule that would incorrectly apply to Tier 3.

## Expected Outcome
- Both rules documented separately and correctly.

## Failure Mode (if applicable)
If only one rule is present or they are conflated: "implementation-agent.md should document balanced mode's tier-conditional model selection (Sonnet for Tier 1/2, Opus for Tier 3)."

## Notes
FR-5 specifies the full table. The balanced-mode split is the only tier-conditional cell; lean and quality are tier-independent.
