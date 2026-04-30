# Scenario: P-06 — Step 0.5 reads spec with limit:40 to extract Implementation Size Estimate

## Type
feature

## Priority
high — Without this fix, every implementation cycle reads up to 88 KB of spec content when only the first ~40 lines are needed. This scenario verifies the limit is present in the compiled agent.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated: Step 0.5 explicitly mentions `limit: 40` when describing how to read the spec for `Implementation Size Estimate`.
- `plugins/dark-factory/agents/implementation-agent.md` has been rebuilt.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/implementation-agent.md` contains the phrase `limit: 40` (or `limit:40`) in the context of Step 0.5 (near the `Implementation Size Estimate` text).

## Expected Outcome
- Assertion passes: `limit: 40` appears in the implementation-agent compiled content.
- The `Implementation Size Estimate` and `limit: 40` phrases appear within reasonable proximity (same section).

## Failure Mode (if applicable)
If `limit: 40` is absent, the agent will default to a full-spec read for the header lookup — the fix is not in effect.

## Notes
The test can use a simple `content.includes('limit: 40')` assertion. A more precise test would check that both `Implementation Size Estimate` and `limit: 40` appear in the `Step 0.5` section. Use `content.indexOf` on the section heading and both phrases to verify ordering if needed.
