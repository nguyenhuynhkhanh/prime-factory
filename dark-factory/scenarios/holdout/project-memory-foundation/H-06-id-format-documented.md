# Scenario: ID format and single-writer protocol are explicitly documented

## Type
edge-case

## Priority
high — BR-1, BR-3, FR-12 are the contract that prevents ID collisions and worktree conflicts in later sub-specs. If they are not written down in the template, downstream agents will drift.

## Preconditions
- `dark-factory/templates/project-memory-template.md` exists.

## Action
Read the template file.

## Expected Outcome
- The template explicitly states that IDs follow the format `INV-NNNN` / `DEC-NNNN` / `FEAT-NNNN` with 4-digit zero-padded sequential numbers.
- The template states that IDs are never reused, even when entries are superseded or deprecated.
- The template states that specs carry `INV-TBD-*` / `DEC-TBD-*` placeholders until promotion.
- The template states that permanent IDs are assigned ONLY by promote-agent at promotion time — no other agent writes IDs.
- The template states that memory files are single-writer (promote-agent is the sole writer once lifecycle ships).
- The template states that the ledger is append-only.

## Notes
Validates FR-12, BR-1, BR-2, BR-3. These are semantic contracts; violating them later would cause real damage, so they must be nailed down at the template level.
