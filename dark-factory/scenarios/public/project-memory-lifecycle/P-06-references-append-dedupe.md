# Scenario: promote-agent handles References — appends spec name to referencedBy, deduplicates

## Type
feature

## Priority
high — reverse linkages power the architect probe and df-cleanup cross-checks.

## Preconditions
- Spec declares `## Invariants > References > INV-0003` (read-only linkage).
- INV-0003 exists with `referencedBy: [spec-a, spec-b]`.
- promote-agent.md edited.

## Action
Read promote-agent.md's References-handler documentation.

## Expected Outcome
- Agent appends the current spec's name to INV-0003's `referencedBy` array.
- Deduplicates — if the spec name is already present, no duplicate is added.
- No other fields on INV-0003 are modified (no status change, no rule change, no history append).
- Works for both invariants and decisions.

## Notes
Also covers EC-26: spec declares both Introduces (new INV-TBD-y) and References (INV-0003). Both ops succeed independently.
