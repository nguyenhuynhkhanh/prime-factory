# Scenario: df-cleanup detects STALE_ENFORCEMENT when enforced_by test file is deleted

## Type
edge-case

## Priority
medium — parallel to existing STALE GUARD check.

## Preconditions
- INV-0003 has `enforced_by: tests/invariant-auth.test.js`.
- That test file has been deleted from the repo.

## Action
`/df-cleanup` runs memory health check.

## Expected Outcome
- Detects file missing.
- Reports: "STALE_ENFORCEMENT: INV-0003 references deleted test tests/invariant-auth.test.js"
- Does NOT auto-fix.
- Does NOT delete INV-0003 automatically.
- Continues to other checks.

## Notes
Covers FR-28. Mirrors the existing STALE GUARD pattern for promoted tests.
