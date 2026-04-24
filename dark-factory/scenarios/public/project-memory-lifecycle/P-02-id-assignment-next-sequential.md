# Scenario: promote-agent assigns next-sequential zero-padded IDs

## Type
feature

## Priority
critical — ID assignment is the core of the write protocol.

## Preconditions
- `.claude/agents/promote-agent.md` edited per this spec.
- Spec introducing two placeholder invariants (`INV-TBD-a` and `INV-TBD-b`) is being promoted.
- Memory currently has invariants INV-0001..INV-0003 (max = 3).

## Action
Read promote-agent.md's ID-assignment documentation.

## Expected Outcome
- The agent documents computing next ID as `max(existing) + 1` per type (INV-NNNN, DEC-NNNN, FEAT-NNNN).
- IDs are zero-padded 4-digit strings (INV-0004, INV-0005 — not INV-4, INV-05).
- Multiple placeholders in one spec get sequential IDs (INV-0004 then INV-0005 — both assigned in this run).
- The agent documents that IDs are never reused, even after supersession.

## Notes
Tests assert the phrases "zero-padded", "sequential", "never reused" (or equivalents) appear in promote-agent.md.
