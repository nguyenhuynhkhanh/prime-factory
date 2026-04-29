# Scenario: findings file path written in Step 0d exactly matches the path deleted in Step 5

## Type
edge-case

## Priority
high — if the write path and delete path use different patterns (e.g., one uses `features/` and the other uses the wrong directory), the findings file will be left behind after cleanup.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.

## Action
Read `src/agents/implementation-agent.src.md`.

1. Extract the findings file path pattern from Step 0d (where it is written).
2. Extract the findings file path from Step 5 (where it is deleted).

## Expected Outcome
- Both Step 0d and Step 5 reference the same path pattern: `dark-factory/specs/features/{name}.findings.md` for feature mode.
- Both reference `dark-factory/specs/bugfixes/{name}.findings.md` for bugfix mode (or a pattern that covers both).
- There is no discrepancy between the write path and the delete path that would leave stale findings files.

## Failure Mode
Path mismatch would result in orphaned `{name}.findings.md` files in the spec directory after cleanup, polluting the repository over multiple pipeline runs.

## Notes
Validates FR-7, BR-5. Holdout because the code-agent may correctly implement both write and delete but with subtly different path strings.
