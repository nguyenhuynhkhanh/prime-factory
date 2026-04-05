# Scenario: Pre-flight gate failure in multi-spec orchestration aborts ALL specs

## Type
edge-case

## Priority
critical — partial execution with a broken test suite is dangerous

## Preconditions
- Three specs: `spec-a`, `spec-b`, `spec-c` queued for orchestration
- The project's test suite has a failing test (unrelated to all three specs)

## Action
Developer runs `/df-orchestrate spec-a spec-b spec-c`

## Expected Outcome
- df-orchestrate runs the test suite ONCE (not per-spec)
- Tests fail
- ALL three specs are aborted — none proceeds to architect review
- No worktrees are created
- Report lists all test failures and all aborted specs

## Failure Mode
If the gate only blocks the first spec but lets others through, the implementation would proceed against a broken test baseline.

## Notes
EC-10: The test suite is shared across all specs. One failure means the baseline is broken for all.
