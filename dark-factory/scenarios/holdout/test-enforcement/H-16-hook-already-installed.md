# Scenario: Hook installation detects existing Dark Factory hook and skips

## Type
edge-case

## Priority
medium — idempotency check

## Preconditions
- `.git/hooks/pre-commit` exists and contains `# dark-factory-hook` marker

## Action
Hook installation is triggered (via onboard or CLI `--hooks`)

## Expected Outcome
- Reads `.git/hooks/pre-commit`
- Finds `# dark-factory-hook` marker
- Reports: "Dark Factory pre-commit hook already installed. Skipping."
- Does NOT modify the file
- Does NOT ask the developer

## Notes
EC-11: Idempotent — running `--hooks` multiple times should be safe.
