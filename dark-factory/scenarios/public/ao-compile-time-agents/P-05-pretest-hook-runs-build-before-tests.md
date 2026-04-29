# Scenario: P-05 — `pretest` hook runs the build before the test suite

## Type
feature

## Priority
high — ensures tests always validate freshly-assembled output

## Preconditions
- `package.json` has `"pretest": "node bin/build-agents.js"` in `scripts`
- A source file in `src/agents/` has been modified (e.g., a shared block was edited) but the build has NOT been run manually since the change

## Action
Run `npm test` (which triggers `node --test tests/`).

## Expected Outcome
- `pretest` runs `node bin/build-agents.js` first
- The build assembles the agents from the updated source
- The test suite then runs against the freshly-assembled output
- Tests that check agent content see the updated content (not the stale pre-edit content)

## Failure Mode (if applicable)
If the build fails (e.g., missing shared file), `npm test` exits before running any tests. The developer sees the build error and must fix it before tests can run.

## Notes
Exercises FR-7 and INV-TBD-b. This can be tested by: (1) making a test edit to a shared file, (2) running `npm test`, (3) verifying the build ran (by checking output file modification time) before the test suite ran.
