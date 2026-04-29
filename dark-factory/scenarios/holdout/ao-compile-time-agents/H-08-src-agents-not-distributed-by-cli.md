# Scenario: H-08 — `src/agents/` is not distributed to target projects by `bin/cli.js`

## Type
edge-case

## Priority
high — target projects must not receive build-time source files they cannot use

## Preconditions
- `src/agents/` directory has been created with all source files
- `bin/cli.js` has NOT been changed (still copies from `plugins/dark-factory/`)
- `package.json` `files` field still contains only `["bin/", "plugins/", ".claude-plugin/"]`

## Action
1. Read `bin/cli.js` — search for any reference to `src/` or `src/agents/`
2. Read `package.json` `files` field
3. Simulate `npx dark-factory init --dir /tmp/test-project` — read the source code path in `cmdInit` to confirm it copies from `plugins/dark-factory/agents/` not `src/agents/`

## Expected Outcome
- `bin/cli.js` has NO reference to `src/agents/` or the `src/` directory
- `package.json` `files` array does NOT include `src/` or `src/agents/`
- The CLI copies agent files from `plugins/dark-factory/agents/` only
- A target project that installs Dark Factory via npm does NOT receive `src/agents/` directory
- The `pretest` script in `package.json` references `bin/build-agents.js` — but this script only executes in the Dark Factory development repo context, not in target projects (since `bin/build-agents.js` looks for `src/agents/` which doesn't exist in target projects — EC-8)

## Failure Mode (if applicable)
N/A.

## Notes
Exercises FR-13, BR-6, DEC-TBD-b, and EC-8. The concern is that `src/` might accidentally get distributed. Since the project uses `files` in `package.json` for npm distribution, adding `src/` to that array would be the only way it leaks — this scenario confirms it doesn't.
