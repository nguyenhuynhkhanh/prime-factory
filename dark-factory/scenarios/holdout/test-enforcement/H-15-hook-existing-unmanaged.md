# Scenario: Hook installation warns when unmanaged .git/hooks/pre-commit exists

## Type
edge-case

## Priority
high — overwriting someone's custom hook would cause data loss

## Preconditions
- No husky, lefthook, or simple-git-hooks detected
- `.git/hooks/pre-commit` already exists with custom content (not from Dark Factory)
- The file does NOT contain `# dark-factory-hook` marker

## Action
Hook installation is triggered

## Expected Outcome
- Detects existing `.git/hooks/pre-commit`
- Checks for `# dark-factory-hook` marker — not found
- Warns developer: "An existing pre-commit hook was found. Contents: <shows first few lines>"
- Asks: "Append Dark Factory test command to existing hook? (y/n)"
- If yes: appends test command and marker to existing file
- If no: skips installation, reports "Hook installation skipped"

## Notes
The hook is not from Dark Factory (no marker), so we must not overwrite it silently.
