# Scenario: df-orchestrate final summary separates failures from regression flags

## Type
edge-case

## Priority
high — developer UX for multi-status outcomes.

## Preconditions
- df-orchestrate/SKILL.md edited.
- A wave has: 2 passed, 1 failed (real failure), 1 pre-existing-regression-flagged, 1 expected-regression-flagged.

## Action
Read df-orchestrate/SKILL.md's final-summary template.

## Expected Outcome
- Final summary has:
  - "Completed specs" block → 2 entries.
  - "Failed specs" block → 1 entry (the real failure).
  - "Pre-existing regressions flagged" block → 1 entry with suggested `/df-debug {owning-feature}`.
  - "Expected regressions (invariant evolution)" block → 1 entry.
- The `preExistingRegression: true` spec is NOT counted in "Failed specs".
- The `expectedRegression: true` spec is NOT counted in "Failed specs".
- Summary counts: "2 passed, 1 failed, 1 pre-existing, 1 expected" (or equivalent).

## Notes
Covers FR-27, EC-20. Separation of blocks is critical — pre-existing is NOT a failure and must be distinct.
