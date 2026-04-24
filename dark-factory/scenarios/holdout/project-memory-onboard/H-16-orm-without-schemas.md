# Scenario: H-16 — ORM declared in package.json but no schema files exist

## Type
edge-case

## Priority
low — EC-6. Real but rare: a project imports an ORM but has not yet written schemas.

## Preconditions
- Phase 3.7a is present.

## Action
Structural test asserts Phase 3.7a documents that ORM presence (in `package.json`) is NOT sufficient for invariant extraction — the agent must find actual schema files before producing candidates. ORM-without-schemas produces zero schema-derived candidates (validation middleware, guard clauses, markdown rules still evaluated).

## Expected Outcome
- Presence-vs-usage distinction documented.
- No false-positive "ORM X is used" invariant.

## Failure Mode (if applicable)
If the documentation suggests deriving invariants from ORM dependency alone, test fails.

## Notes
This is a minor but important correctness constraint. The agent should not produce "the project uses Mongoose" as an invariant — that is a decision (if anything), not an invariant.
