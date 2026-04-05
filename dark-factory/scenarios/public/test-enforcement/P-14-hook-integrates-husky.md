# Scenario: Hook installation integrates with husky

## Type
feature

## Priority
high — husky is the most common git hook manager in JS projects

## Preconditions
- Project has husky installed (`.husky/` directory exists or `husky` in package.json devDependencies)
- `.husky/pre-commit` may or may not already exist

## Action
Hook installation is triggered (via onboard or `bin/cli.js init --hooks`)

## Expected Outcome
- Detects husky infrastructure
- If `.husky/pre-commit` does not exist: creates it with the test command
- If `.husky/pre-commit` exists: appends the test command (does NOT overwrite existing content)
- Adds `# dark-factory-hook` comment marker
- Does NOT write to `.git/hooks/pre-commit` directly (husky manages that)
- Reports: "Added test command to .husky/pre-commit"

## Notes
BR-7: Integrate, don't overwrite. FR-9: Detect existing infrastructure.
