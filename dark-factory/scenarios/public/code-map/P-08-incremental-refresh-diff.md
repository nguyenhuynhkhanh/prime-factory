# Scenario: Incremental refresh shows summary diff of changes

## Type
feature

## Priority
high -- without diff visibility, developers cannot make informed accept/reject decisions

## Preconditions
- Existing code-map.md from a previous onboard run
- Since last run: 3 new modules added, 1 module removed, 2 dependency edges changed
- Developer runs `/df-onboard` again

## Action
Onboard-agent runs Phase 3.5, detects existing code-map.md, generates new code map, and compares.

## Expected Outcome
- Developer is shown a summary diff before confirmation, e.g.:
  "3 new modules, 2 dependency changes, 1 module removed"
- The diff is a summary (not a line-by-line diff of the markdown)
- Developer can accept the new code map or reject it (preserving the existing one)
- Code map is treated as atomic for accept/reject (not per-section)

## Notes
Validates FR-9 and EC-16. The diff should be human-readable, not a raw git diff.
