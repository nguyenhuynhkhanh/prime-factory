# Scenario: P-02 — Pre-flight gate preserves full TAP output at expected temp file path

## Type
feature

## Priority
high — The optimization must not destroy debugging capability. The full output must be available at the documented path. This scenario verifies the temp file path convention is correctly written into the agent.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated with the tee + grep pattern.
- `plugins/dark-factory/agents/implementation-agent.md` has been rebuilt from source.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/implementation-agent.md` contains the string `/tmp/preflight-` (confirming the pre-flight temp file path prefix is documented as part of the test run command).

## Expected Outcome
- The assertion passes: the compiled agent content includes `/tmp/preflight-`.
- The test confirms the path is distinct from the Step 2.75 regression gate path (which uses `/tmp/regression-`).

## Failure Mode (if applicable)
If the path is absent, the agent has no guidance on where to find the full output. A developer trying to debug a pipeline failure would have no documented location to look.

## Notes
The spec mandates these exact path prefixes: `/tmp/preflight-{specName}.tap` and `/tmp/regression-{specName}.tap`. The test only needs to verify the prefix (not the full path with `{specName}` placeholder) since the specName is runtime-determined.
