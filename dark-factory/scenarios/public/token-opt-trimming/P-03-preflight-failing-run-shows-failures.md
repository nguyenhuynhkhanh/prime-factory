# Scenario: P-03 — Pre-flight gate failing run injects failure lines and summary into context

## Type
feature

## Priority
critical — If the filter accidentally drops failure output, the agent sees a clean-looking run and may proceed when it should stop. This scenario verifies that failure lines survive the filter (BR-4: pass/fail decision unchanged).

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated.
- The test describes the pre-flight gate behavior: when `npm test` produces `not ok` lines, those lines are included in the filtered output passed to the agent.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/implementation-agent.md` documents the failure-routing behavior:
1. The grep filter captures `not ok` lines (they match `^not ok`).
2. The agent stops or reports failures when `not ok` lines are present in the filtered output.

Alternatively, if the implementation test uses a real grep simulation: given mock TAP input containing `not ok 42 - Some test failed`, the grep filter must output that line.

## Expected Outcome
- Assertion passes: the agent content describes stopping on failure based on the filtered output.
- The filter expression `^not ok` is present (this is the failure detection pattern).
- The gate's stop-on-failure behavior is documented alongside the filter.

## Failure Mode (if applicable)
If the agent only looks at exit code and the grep filter is applied after the exit code check, there is a risk of correct behavior but undocumented contract. The test must verify that the agent documentation is clear: filtered output is sufficient for failure detection.

## Notes
The current pre-flight gate says: "Run the test suite. If failures: report ALL failures and STOP." After this change, it should say something equivalent about reporting filtered failures from the filtered output. The test verifies this behavioral description is preserved.
