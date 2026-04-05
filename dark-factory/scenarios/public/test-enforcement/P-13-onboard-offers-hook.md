# Scenario: Onboard-agent offers git pre-commit hook installation

## Type
feature

## Priority
high — opt-in hook is the final enforcement layer

## Preconditions
- Developer runs `/df-onboard` on a project
- No existing git hook infrastructure detected (no husky, lefthook, or simple-git-hooks)
- Project profile has a test command

## Action
onboard-agent reaches the hook setup phase

## Expected Outcome
- onboard-agent asks: "Would you like to install a git pre-commit hook that runs your tests before each commit?"
- If developer says yes:
  - Creates `.git/hooks/pre-commit` with the project's test command
  - Makes it executable (`chmod +x`)
  - Adds `# dark-factory-hook` comment marker for detection
- If developer says no:
  - Skips hook installation
  - Reports: "Skipped pre-commit hook installation"
- onboard-agent continues to next phase regardless

## Notes
FR-8: Opt-in, not mandatory. BR-6: Two entry points (onboard + CLI --hooks).
