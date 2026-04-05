# Scenario: bin/cli.js init --hooks installs pre-commit hook

## Type
feature

## Priority
high — the CLI entry point for hook installation

## Preconditions
- Dark Factory is installed in the project
- `dark-factory/project-profile.md` exists with a test command
- No existing git hook infrastructure

## Action
Developer runs `npx dark-factory init --hooks`

## Expected Outcome
- CLI parses `--hooks` flag
- Does NOT run full init (no agent/skill copying, no directory creation)
- Reads test command from project profile
- Creates `.git/hooks/pre-commit` with the test command
- Makes it executable
- Adds `# dark-factory-hook` comment marker
- Reports: "Pre-commit hook installed"

## Notes
FR-10: Independent of onboard. BR-6: Same outcome as the onboard path.
