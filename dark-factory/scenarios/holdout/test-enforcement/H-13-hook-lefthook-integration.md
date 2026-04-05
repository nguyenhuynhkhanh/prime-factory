# Scenario: Hook installation integrates with lefthook

## Type
feature

## Priority
medium — lefthook is the second most common hook manager

## Preconditions
- Project has `lefthook.yml` in root directory
- `lefthook.yml` has an existing `pre-commit` section with other commands

## Action
Hook installation is triggered

## Expected Outcome
- Detects lefthook infrastructure via `lefthook.yml`
- Adds a new command under `pre-commit > commands` in `lefthook.yml`:
  ```yaml
  pre-commit:
    commands:
      existing-lint:
        run: eslint .
      dark-factory-tests:  # dark-factory-hook
        run: <test command from profile>
  ```
- Does NOT overwrite existing commands
- Does NOT write to `.git/hooks/pre-commit`
- Reports: "Added test command to lefthook.yml"

## Notes
BR-7: Integrate with existing infrastructure. FR-9: Detect lefthook.
