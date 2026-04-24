# Scenario: Supersession chain over multiple generations preserves all prior entries

## Type
edge-case

## Priority
high — chain integrity under repeated supersession.

## Preconditions
- INV-0001 was superseded by INV-0003 previously (INV-0001.status = superseded, supersededBy = INV-0003).
- INV-0003 is currently active.
- spec-x declares `## Invariants > Supersedes > INV-0003` and introduces `INV-TBD-y` replacement.

## Action
promote-agent processes spec-x.

## Expected Outcome
- `INV-TBD-y` gets a new permanent ID (e.g., INV-0008).
- INV-0003 now has `status: superseded`, `supersededBy: INV-0008`.
- INV-0001 REMAINS with its existing `supersededBy: INV-0003` (unchanged — no supersession cascade per shared-context decision).
- INV-0008 is materialized fresh.
- Three entries co-exist in invariants.md: INV-0001 (superseded), INV-0003 (superseded), INV-0008 (active).

## Notes
Covers EC-2 + explicit "no supersession cascade" rule. Reader walking backwards from INV-0008 sees INV-0003, then INV-0001 — full chain visible.
