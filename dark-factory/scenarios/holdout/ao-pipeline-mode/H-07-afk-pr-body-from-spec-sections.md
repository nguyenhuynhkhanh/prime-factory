# Scenario: H-07 — `--afk` PR body is constructed from spec's Context and Acceptance Criteria sections

## Type
feature

## Priority
high — FR-12, FR-14, FR-15. The PR body content and construction method are both specified. Using shell interpolation instead of a temp file would be a security defect.

## Preconditions
- `--afk` flag passed.
- `gh` CLI is available.
- Spec file has been promoted successfully.
- Spec file still exists (cleanup has not yet run).

## Action
Structural test verifies that `implementation-agent.md` (or df-orchestrate SKILL.md) documents:
1. PR body content source: `## Context` and `## Acceptance Criteria` sections from the spec.
2. PR body delivery method: `--body-file {tmp-file}` (NOT inline shell interpolation or `--body`).
3. The temp file is cleaned up after the PR creation attempt.

## Expected Outcome
- All three assertions pass: source sections named, body-file method used, cleanup documented.

## Failure Mode (if applicable)
If `--body` instead of `--body-file` is used: "Auto-PR must use --body-file (not --body) to prevent shell injection from spec content."

## Notes
NFR-4 requires temp file cleanup after attempt. FR-15 makes body-file mandatory. This combination prevents shell injection of spec content that may contain backticks, `$VAR`, or other special characters (EC-8).
