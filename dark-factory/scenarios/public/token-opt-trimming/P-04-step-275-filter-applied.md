# Scenario: P-04 — test-agent Step 2.75 applies tee + grep filter to regression gate output

## Type
feature

## Priority
critical — Step 2.75 is the second callsite. Symmetry with the pre-flight fix is a hard requirement (BR-1: canonical filter identical in both callsites). This scenario verifies the test-agent was updated, not just the implementation-agent.

## Preconditions
- `src/agents/test-agent.src.md` has been updated with the tee + grep pattern in Step 2.75.
- `plugins/dark-factory/agents/test-agent.md` has been rebuilt from source.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/test-agent.md` contains:
1. A reference to `tee` combined with the temp file path pattern `/tmp/regression-`.
2. The grep filter expression `grep -E '^not ok|^# (tests|pass|fail)'`.

## Expected Outcome
- Both assertions pass for the compiled test-agent content.
- The path prefix `/tmp/regression-` is distinct from `/tmp/preflight-` (verified separately in H-03).

## Failure Mode (if applicable)
If tee or grep is absent from the Step 2.75 section, the regression gate still floods agent context with full TAP output — the optimization is incomplete.

## Notes
The test-agent Step 2.75 section heading is `## Step 2.75: Full-Suite Regression Gate (validator mode only)`. The filter and tee pattern must appear in that section or in the instructions for the test run command within it.
