# Scenario: P-07 — Contracts test detects out-of-sync `src/` vs assembled output

## Type
feature

## Priority
critical — the CI safety net for the "edit src/ but forget to build" mistake

## Preconditions
- `tests/dark-factory-contracts.test.js` has been updated with the "built output matches source" test
- A developer has edited `src/agents/shared/context-loading.md` but has NOT run `node bin/build-agents.js`
- The assembled `.claude/agents/*.md` files therefore do NOT reflect the edit

## Action
Run `node --test tests/dark-factory-contracts.test.js` directly (bypassing `pretest` to simulate the stale state).

## Expected Outcome
- The "built output matches source" test FAILS
- The failure message names the specific agent file(s) that are out of sync
- The test does NOT silently pass with stale output

## Failure Mode (if applicable)
N/A — this scenario is testing the failure detection itself.

## Notes
Exercises FR-9, INV-TBD-a, and INV-TBD-b. This scenario simulates running `node --test` directly (not via `npm test`) to bypass the `pretest` hook. The contracts test must catch the mismatch independently of the pretest hook.
