# Scenario: Pre-existing regression does NOT block promotion, even when alone

## Type
failure-recovery

## Priority
critical — the core resilience invariant.

## Preconditions
- Spec touches files: `src/auth.js`.
- Promoted test's `Guards:` annotation: `src/billing.js:17` (zero overlap).
- Promoted test fails in Step 2.75.
- ALL new holdout tests PASS (no other failures).
- The promoted test's owning feature is `old-billing-feature` (from annotation).

## Action
implementation-agent receives Step 2.75 result.

## Expected Outcome
- Classified as `class: pre-existing-regression`.
- `preExistingRegression: true` in manifest.
- Loud warning emitted: "Pre-existing regression detected in tests/billing.test.js. This feature does not touch files in its Guards annotation. Proceeding with promotion. Consider running `/df-debug old-billing-feature`."
- Promotion PROCEEDS (code-agent NOT re-spawned, rounds NOT incremented, no block).
- Final summary includes pre-existing regression in its own block, not in failures.

## Notes
Covers BR-4, INV-TBD-d. This is the lead-flagged "one stale test halts the whole shop" mitigation.
