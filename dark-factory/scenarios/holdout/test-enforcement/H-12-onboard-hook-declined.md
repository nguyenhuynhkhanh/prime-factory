# Scenario: Developer declines hook during onboard

## Type
feature

## Priority
medium — opt-in means the decline path must work cleanly

## Preconditions
- Developer runs `/df-onboard`
- No existing hook infrastructure

## Action
onboard-agent asks about hook installation, developer says no

## Expected Outcome
- No `.git/hooks/pre-commit` file is created
- No hook configuration is modified
- onboard-agent reports: "Skipped pre-commit hook installation"
- onboard-agent continues to Phase 8 (Configure Agent Permissions) normally
- Profile is written without any hook-related notes that imply hooks are installed

## Notes
The decline must be clean — no partial state, no leftover files.
