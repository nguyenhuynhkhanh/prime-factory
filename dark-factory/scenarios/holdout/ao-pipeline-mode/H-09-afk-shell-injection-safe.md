# Scenario: H-09 — `--afk` PR body uses body-file to safely handle special characters in spec content

## Type
edge-case

## Priority
critical — FR-15, EC-8. Spec content regularly contains shell-special characters: backticks in code examples, `$VARIABLE` in environment descriptions, curly braces in JSON. Interpolating this content directly into shell commands creates injection risk.

## Preconditions
- `--afk` flag passed.
- Spec file's `## Context` section contains: backtick characters, `$VAR` references, double-quote characters, and curly brace sequences.
- `gh` CLI is available.

## Action
Structural test verifies that `implementation-agent.md` (or df-orchestrate SKILL.md) documents the temp-file approach and explicitly excludes inline shell interpolation:
1. The `gh pr create` command uses `--body-file {tmp-file}` not `--body "..."` or backtick interpolation.
2. The temp file is written first, then the `gh` command runs.
3. The spec's `--afk --skip-tests` warning text is present: "Running with --skip-tests and --afk — PR will be created for an implementation that skipped pre-flight tests."

## Expected Outcome
- All three assertions pass.

## Failure Mode (if applicable)
"Auto-PR must use --body-file to prevent shell injection (found inline --body interpolation)."

## Notes
NFR-4 (temp file cleanup) is verified in H-07. This scenario focuses on the safety rationale (EC-8 shell injection vector) and the --afk --skip-tests warning text (FR-18, P-13).
