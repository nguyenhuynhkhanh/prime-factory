# Scenario: H-08 — `--afk` without `gh` CLI gracefully warns and continues

## Type
failure-recovery

## Priority
critical — FR-13, FR-17, BR-9. If the pipeline exits non-zero or stops on a missing `gh` binary, all users without `gh` installed have their pipeline broken by the `--afk` flag. Non-blocking is mandatory.

## Preconditions
- `--afk` flag passed.
- `gh` CLI is NOT installed (or not on PATH).

## Action
Structural test verifies that `implementation-agent.md` (or df-orchestrate SKILL.md) documents:
1. A `gh --version` check before any `gh pr create` attempt.
2. If `gh` not found: a warning message is logged (not an error exit).
3. The exact warning text matches: "gh CLI not found — skipping auto-PR. Install from https://cli.github.com" (or close equivalent with the installation URL).
4. Pipeline continues normally (the overall run status is not affected).

## Expected Outcome
- All four assertions pass.

## Failure Mode (if applicable)
If the documentation shows an error exit: "gh not found should emit a warning, not abort the pipeline."

## Notes
This also partially covers BR-9 and EC-7 (multi-spec run where one spec fails — PRs only for successful specs). The full EC-7 scenario is H-11.
