# Scenario: promote-agent handles Modifies — updates entry and appends history

## Type
feature

## Priority
critical — durable evolution of invariants/decisions.

## Preconditions
- Spec declares `## Invariants > Modifies > INV-0003` with a new `rule` value.
- Memory INV-0003 currently exists with prior rule value.
- promote-agent.md edited.

## Action
Read promote-agent.md's Modifies-handler documentation.

## Expected Outcome
- Agent locates the existing entry by ID.
- Updates the `rule` (or `decision` for DEC) field to the spec's new value.
- Appends a record to the entry's `history:` array: `{ previousValue, modifiedBy: <spec-name>, modifiedAt: <ISO now> }`.
- Sets `lastModifiedBy: <spec-name>` on the entry.
- Bumps frontmatter `lastUpdated`.

## Notes
History preservation is non-negotiable — the "why did this change?" question has no answer without it.
