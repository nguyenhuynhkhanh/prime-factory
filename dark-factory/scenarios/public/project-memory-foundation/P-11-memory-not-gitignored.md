# Scenario: dark-factory/memory/ is tracked by git; dark-factory/results/ remains gitignored

## Type
feature

## Priority
critical — memory is committed project state, not ephemeral output. Getting this wrong silently loses all memory.

## Preconditions
- `.gitignore` exists at the repository root.
- `dark-factory/memory/` directory exists.

## Action
Read `.gitignore`. Compare against the memory directory and the results directory.

## Expected Outcome
- `dark-factory/memory/` is NOT matched by any line in `.gitignore`.
- `dark-factory/memory/*.md` is NOT matched by any line in `.gitignore`.
- `dark-factory/results/` IS still matched by `.gitignore` (backward-compat: prior gitignore behavior preserved).
- `dark-factory/manifest.json` is NOT gitignored (preserved existing behavior).

## Notes
Validates FR-17. The contrast with `dark-factory/results/` is intentional — memory is durable, results are local-only.
