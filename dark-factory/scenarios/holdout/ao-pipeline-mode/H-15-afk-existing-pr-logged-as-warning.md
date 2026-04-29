# Scenario: H-15 — `--afk` with `gh pr create` returning "already exists" is logged as a warning

## Type
edge-case

## Priority
medium — EC-9. If a branch already has an open PR (from a previous run or manual creation), `gh pr create` returns a non-zero exit with "already exists" error. This must not fail the pipeline.

## Preconditions
- `--afk` flag passed.
- `gh` CLI is available.
- The branch for the promoted spec already has an open PR.
- `gh pr create` returns an error containing "already exists" (or equivalent non-zero exit).

## Action
Structural test verifies that `implementation-agent.md` (or df-orchestrate SKILL.md) documents the "already exists" error handling:
1. The error is caught and logged as a warning (not propagated as a pipeline failure).
2. The warning message includes the spec name and the error.
3. The pipeline continues to the next spec's PR attempt.

## Expected Outcome
- All three assertions pass: caught, logged as warning, pipeline continues.

## Failure Mode (if applicable)
"--afk should log 'already exists' as a warning, not fail the pipeline."

## Notes
EC-9 specifies: "log the error as a warning, do not retry, continue." The general `gh pr create` failure handling (auth/network) uses the same non-blocking pattern (FR-17). This scenario tests the specific "already exists" variant.
