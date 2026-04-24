# Scenario: spec-agent may reject advisor recommendations — advisor is not mandatory

## Type
edge-case

## Priority
medium — authority boundary.

## Preconditions
- df-intake/SKILL.md edited.
- Advisor returns: `dedup: [{ scenario: X, matchedFeature: old-feat }]` — claims a draft scenario duplicates an existing promoted test.
- spec-agent disagrees (e.g., the existing promoted test covers a superset but not the edge case this scenario targets).

## Action
spec-agent processes advisor output.

## Expected Outcome
- df-intake/SKILL.md documents: spec-agent is authoritative; MAY accept or reject any advisory item.
- The "Testability review: N kept, M revised, K removed as duplicate, J flagged for infrastructure" summary reflects what spec-agent ACTUALLY did, not what advisor recommended.
- No automatic application of advisor recommendations.
- No override prompt to developer — spec-agent's judgment is final within the intake phase.

## Notes
Covers EC-19. The advisor is an advisor, not an enforcer. Lead C flagged authority boundaries as important.
