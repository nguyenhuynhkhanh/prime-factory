# Scenario: df-orchestrate final summary surfaces pre-existing regressions loudly

## Type
feature

## Priority
high — prevents pre-existing regressions from being silently absorbed.

## Preconditions
- df-orchestrate/SKILL.md edited.

## Action
Read df-orchestrate/SKILL.md's final summary section.

## Expected Outcome
- Final summary template includes a new block: "Pre-existing regressions flagged" listing each spec with `preExistingRegression: true` along with the owning feature and suggested `/df-debug {feature}` next step.
- Optionally, a parallel "Expected regressions (invariant evolution)" block for specs with `expectedRegression: true`.
- These blocks are SEPARATE from the "Failed specs" list — pre-existing / expected do NOT count as failures.

## Notes
Covers FR-27. The "loud" part matters — buried warnings get ignored.
