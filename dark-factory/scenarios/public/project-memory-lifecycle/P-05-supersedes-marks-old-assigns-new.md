# Scenario: promote-agent handles Supersedes — old entry marked, new entry assigned fresh ID

## Type
feature

## Priority
critical — supersession is the schema-aware replace operation.

## Preconditions
- Spec declares `## Invariants > Supersedes > INV-0003` and also introduces a fresh `INV-TBD-x` replacement.
- INV-0003 exists in memory with `status: active`.
- promote-agent.md edited.

## Action
Read promote-agent.md's Supersedes-handler documentation.

## Expected Outcome
- Assigns the new entry a fresh permanent ID (e.g., INV-0008).
- Updates INV-0003 in place: `status: superseded`, `supersededBy: INV-0008`, `supersededAt: <ISO now>`, `supersededBySpec: <spec-name>`.
- INV-0003 REMAINS in invariants.md (NOT deleted — locked by foundation BR-3).
- The new INV-0008 is materialized per standard Introduces flow.

## Notes
Tests assert the phrases "status: superseded", "supersededBy", and "NOT deleted" (or equivalent) appear in promote-agent.md.
