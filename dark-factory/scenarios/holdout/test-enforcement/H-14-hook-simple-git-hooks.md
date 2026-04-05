# Scenario: Hook installation integrates with simple-git-hooks

## Type
feature

## Priority
medium — simple-git-hooks is used by Vue, Vite, and other popular projects

## Preconditions
- `package.json` has `"simple-git-hooks"` section or `simple-git-hooks` in devDependencies
- No existing `pre-commit` hook configured

## Action
Hook installation is triggered

## Expected Outcome
- Detects simple-git-hooks infrastructure
- Adds `"pre-commit": "<test command>"` to the `simple-git-hooks` section in `package.json`
- If `simple-git-hooks` section already has a `pre-commit` key: appends the test command with `&&` separator
- Reports: "Added test command to package.json simple-git-hooks"

## Notes
BR-7: Integrate, don't overwrite.
