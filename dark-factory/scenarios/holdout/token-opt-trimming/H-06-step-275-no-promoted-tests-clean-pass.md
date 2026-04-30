# Scenario: H-06 — Step 2.75 regression gate handles empty promoted-tests.json cleanly (EC-6, BR-4)

## Type
edge-case

## Priority
medium — A project that has never promoted any tests will have an empty or minimal `promoted-tests.json`. The regression gate must not error or produce unexpected output when the suite has no promoted tests. The filter should return zero lines, and the gate should pass cleanly.

## Preconditions
- `src/agents/test-agent.src.md` has been updated.
- The Step 2.75 section handles the case where the promoted test suite is empty.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that the compiled `test-agent.md` Step 2.75 section does not assume the promoted test suite is non-empty. Specifically, the `regressionGate: { status: "skipped" }` path (no `Run:` command) is documented, and there is no implicit assertion that the test suite will produce output.

Verify also that the filter (returning zero lines on a clean run of an empty suite) is documented as a passing state — zero lines from grep = no failures detected.

## Expected Outcome
- Step 2.75 documentation handles empty output from grep gracefully (zero lines = pass).
- The `regressionGate: { status: "skipped" }` path is still present (existing behavior preserved).
- No "no promoted tests" warning causes the gate to error.

## Failure Mode (if applicable)
If the gate expects at least one test result line and treats zero-line grep output as an error, new projects (no promoted tests) would fail the regression gate immediately — a false positive that would block all early-stage features.

## Notes
EC-6: the filter returning zero lines is the expected state for a clean run — it means "no failures." The gate must interpret zero lines as PASS, not as missing output or an error condition.
