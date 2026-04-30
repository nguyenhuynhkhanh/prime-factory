# Scenario: H-03 — Temp file paths are distinct between pre-flight and Step 2.75 gates (EC-7, BR-2)

## Type
edge-case

## Priority
medium — When both gates run in the same implementation cycle, they must write to different `/tmp` paths. If they share a path, the regression gate would overwrite the pre-flight tap file, destroying the pre-flight debug artifact.

## Preconditions
- Both `src/agents/implementation-agent.src.md` and `src/agents/test-agent.src.md` have been updated.
- Both compiled agents exist.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify:
1. `implementation-agent.md` contains `/tmp/preflight-` (pre-flight path prefix).
2. `test-agent.md` contains `/tmp/regression-` (regression gate path prefix).
3. Neither file contains the other's path prefix in the wrong section (i.e., `implementation-agent.md` does not reference `/tmp/regression-` in the pre-flight section, and `test-agent.md` does not reference `/tmp/preflight-` in Step 2.75).

## Expected Outcome
- Path prefixes are correct per agent.
- No cross-contamination of path conventions.
- Both paths use the `/tmp/` directory.

## Failure Mode (if applicable)
If both gates write to the same path (e.g., both use `/tmp/test-output.tap`), debugging is broken: the second gate's run overwrites the first gate's output. On a failing pre-flight, the developer would find the regression output in the "pre-flight" file.

## Notes
EC-7: both gates can and do run in the same session. The spec assigns `preflight` vs `regression` prefixes specifically to avoid this collision. This test protects against accidental copy-paste between the two sections.
