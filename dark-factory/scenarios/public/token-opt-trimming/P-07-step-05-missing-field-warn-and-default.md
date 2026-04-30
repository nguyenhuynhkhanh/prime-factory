# Scenario: P-07 — Step 0.5 warns and defaults to medium when Implementation Size Estimate not in first 40 lines

## Type
feature

## Priority
medium — This is the defensive fallback for non-conforming specs (EC-3, BR-5). Without it, a malformed spec could silently break parallelism decisions.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated: Step 0.5 documents the warning + default behavior when the field is not found in the first 40 lines.
- `plugins/dark-factory/agents/implementation-agent.md` has been rebuilt.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/implementation-agent.md` contains:
1. Text describing the fallback behavior when `Implementation Size Estimate` is not found in the first 40 lines.
2. The default value `medium` in that fallback context.
3. A reference to warning/logging the situation.

## Expected Outcome
- Assertions pass: the agent content documents the warning and the `medium` default.
- The phrase `medium` appears as the default in the Step 0.5 fallback context.

## Failure Mode (if applicable)
If the fallback is undocumented, agents encountering a non-conforming spec may throw an error or silently use incorrect parallelism assumptions.

## Notes
The exact warning text from the spec is: "Implementation Size Estimate not found in first 40 lines of spec — defaulting to medium". The test can match a key substring such as `defaulting to medium` or `not found in first 40 lines`.
