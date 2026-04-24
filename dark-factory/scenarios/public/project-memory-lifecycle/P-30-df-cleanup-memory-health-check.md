# Scenario: df-cleanup adds a Memory Health Check with four detection categories

## Type
feature

## Priority
high — mirrors existing STALE GUARD check for promoted tests.

## Preconditions
- `.claude/skills/df-cleanup/SKILL.md` edited.

## Action
Read df-cleanup/SKILL.md.

## Expected Outcome
- A new "Memory Health Check" step exists (suggested position: step 2.5, between Promoted Test Health Check and Identify Issues).
- The step detects and reports four categories:
  - `MALFORMED_MEMORY` — memory file unparseable; suggest `--rebuild-memory`.
  - `STALE_ENFORCEMENT` — an invariant's `enforced_by` test path no longer exists.
  - `STALE_SOURCE` — an entry's `sourceRef` file no longer exists.
  - `STALE_LEDGER` — a FEAT entry's `promotedTests` path doesn't match `promoted-tests.json`.
- All issues are REPORTED — never auto-fixed.
- The developer resolves manually.

## Notes
Covers FR-28, BR-13. Follows existing Promoted Test Health Check structure.
