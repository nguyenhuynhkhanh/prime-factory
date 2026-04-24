# Scenario: dark-factory/memory/ directory exists

## Type
feature

## Priority
critical — foundation requirement. All downstream sub-specs assume this directory exists.

## Preconditions
- Repository has been checked out on the branch that lands this spec.

## Action
Inspect the filesystem at the repository root.

## Expected Outcome
- `dark-factory/memory/` directory exists.
- It is a regular directory (not a symlink, not a file).

## Notes
Validates FR-1. Simplest possible structural assertion. If this fails, everything else fails.
