# Scenario: H-01 — Pre-flight gate stops correctly when all 885 tests fail (EC-2, BR-4)

## Type
edge-case

## Priority
critical — The filter optimization must not break the gate's stop-on-failure behavior even under extreme failure volume. If the filtered output from 885 failures is still injected but the gate logic fails to halt, the pipeline would proceed with a broken codebase.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated with tee + grep.
- The compiled agent's pre-flight gate section describes: when `not ok` lines are present in the filtered output, the gate stops and reports them.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that the compiled `implementation-agent.md` documents the failure decision logic working on the filtered output:
1. Filtered output containing `not ok` lines → stop.
2. The stopping behavior is not dependent on the absence of `not ok` lines (i.e., the gate does not only stop on empty output).

Additionally, verify that the pre-flight section does NOT say "report ALL failures" in a way that would imply unfiltered output — it should say "report failures from filtered output" or equivalent.

## Expected Outcome
- The stop-on-failure logic is confirmed to work on filtered output.
- The agent content does not imply injecting raw TAP for failure reporting.
- The test suite shows no regressions in existing pre-flight gate tests.

## Failure Mode (if applicable)
If the agent still tries to report "ALL failures" from raw output (reverts to old behavior for failures), the optimization is bypassed on the failure path — which is exactly the path where raw output is largest.

## Notes
EC-2: even with 885 `not ok` lines, the filtered context is far smaller than raw TAP because TAP failure lines are one line each while raw TAP includes indented diagnostic blocks per failure.
