# Scenario: H-11 — `--afk` in multi-spec run: failed specs do not get a PR

## Type
edge-case

## Priority
high — EC-7, BR-10. In a multi-spec run, some specs may succeed and others fail. The `--afk` flag should only create PRs for promoted specs; creating a PR for a failed spec would be misleading.

## Preconditions
- `--afk` and `--all` (or `--group`) flags combined.
- Multi-spec run: `spec-a` promoted successfully, `spec-b` failed (architect blocked or 3 rounds exhausted).

## Action
Structural test verifies that `implementation-agent.md` (or df-orchestrate SKILL.md) documents the selective PR behavior:
1. PRs are created only for promoted specs.
2. Failed/blocked specs are listed in the final summary with: "PR skipped: spec failed" (or equivalent).
3. A `gh pr create` failure (auth/network/existing PR) is non-blocking: log error with fallback message, continue to next spec's PR.

## Expected Outcome
- All three assertions pass.
- The final summary clearly separates promoted-with-PR specs from failed-without-PR specs.

## Failure Mode (if applicable)
"--afk should only create PRs for promoted specs, not failed/blocked specs."

## Notes
BR-10 defines the selective PR rule. BR-9 defines the non-blocking failure rule. The gh pr create failure path (EC-9) is covered here as well: "already exists" should be logged as a warning, not an error, and the pipeline continues.
