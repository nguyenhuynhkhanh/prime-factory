# Scenario: All three memory files exist

## Type
feature

## Priority
critical — foundation requirement.

## Preconditions
- `dark-factory/memory/` directory exists (see P-01).

## Action
List the contents of `dark-factory/memory/`.

## Expected Outcome
- `dark-factory/memory/invariants.md` exists.
- `dark-factory/memory/decisions.md` exists.
- `dark-factory/memory/ledger.md` exists.
- Each is a regular file with non-zero size.

## Notes
Validates FR-1. Locks the three-file layout (DEC-TBD-b).
