# Scenario: H-02 — Best-of-N: Both tracks pass — Track A promoted (deterministic tie-break)

## Type
feature

## Priority
high — FR-10, BR-7, EC-4. When both tracks pass, the tie-break must be deterministic (always Track A). Non-deterministic promotion introduces random promotion behavior across retries.

## Preconditions
- `--mode quality` flag passed.
- Spec is Tier 3.
- Both Track A and Track B holdout validations pass.

## Action
Structural test verifies that `implementation-agent.md` explicitly documents the both-pass outcome:
1. "Both pass → promote Track A" (or equivalent deterministic rule favoring A).
2. Manifest records `"loserResult": "both-passed"` (not `"failed-holdout"`).
3. The summary notes that both passed and Track B's worktree is available for developer inspection.

## Expected Outcome
- All three assertions pass.
- The tie-break is always Track A (not Track B, not random).

## Failure Mode (if applicable)
If the documentation says "promote the first one" without naming Track A: test fails with "Both-pass tie-break should explicitly promote Track A."

## Notes
BR-7 makes Track A the deterministic choice. This prevents non-determinism in automated runs. Track B worktree is preserved (not deleted) until the developer chooses to inspect it.
