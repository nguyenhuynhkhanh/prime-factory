# Scenario: Retired IDs are NEVER reused, even when superseded entries are rare

## Type
edge-case

## Priority
critical — ID monotonicity is a foundation invariant.

## Preconditions
- Memory invariants.md contains: INV-0001 (active), INV-0002 (superseded by INV-0004), INV-0003 (active), INV-0004 (active), INV-0005 (deprecated).
- max existing ID = 5.
- A spec introduces one new `INV-TBD-a`.

## Action
promote-agent processes the spec.

## Expected Outcome
- The new entry is assigned INV-0006 (max + 1).
- INV-0002's slot (superseded) is NOT reused.
- INV-0005's slot (deprecated) is NOT reused.
- Gaps in the middle of the sequence (if any existed) are NOT backfilled.
- Documentation of this behavior is asserted in promote-agent.md.

## Notes
This covers the "what about deprecated/superseded slots?" edge. Tests should include a snippet of memory with a mix of statuses and assert that the computed next ID is `max + 1`, not `smallest gap`.
