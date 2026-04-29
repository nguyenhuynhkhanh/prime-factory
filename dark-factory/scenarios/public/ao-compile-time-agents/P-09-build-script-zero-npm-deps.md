# Scenario: P-09 — Build script uses only Node.js stdlib (zero npm dependencies)

## Type
feature

## Priority
high — a dep would break the script in environments without node_modules

## Preconditions
- `bin/build-agents.js` exists

## Action
Read `bin/build-agents.js`. Parse all `require()` calls. Check each required module name.

## Expected Outcome
- All `require()` calls reference built-in Node.js modules only (`fs`, `path`, `os`, `child_process`, etc.)
- No `require()` call references a package name that would need to be installed from npm (no relative path starting with package name, no `@`-scoped packages)
- `node_modules` is NOT listed as a dependency in `package.json` for this project (already the case — project has zero npm runtime deps)

## Failure Mode (if applicable)
N/A.

## Notes
Exercises NFR-1 and INV-TBD-c. Consistent with the pattern established by `bin/cli.js`.
