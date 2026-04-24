# Scenario: Step 2.75 run with BOTH invariant-regression AND pre-existing-regression

## Type
edge-case

## Priority
high — classes are not mutually exclusive AT THE RUN LEVEL (only per-test).

## Preconditions
- Step 2.75 runs 500 tests.
- Test A fails: its Guards overlap touched files → invariant-regression.
- Test B fails: its Guards do not overlap → pre-existing-regression.
- All new-holdout tests pass.

## Action
test-agent produces the Step 2.75 result.

## Expected Outcome
- Structured output has BOTH classes represented in `failingTests`.
- `preExistingRegression: true`.
- `expectedRegression: false`.
- `regressionResult.class`: the primary class — by convention, the most severe class present, which is `invariant-regression` (because it requires a code-agent loop).
- implementation-agent:
  - Loops back for invariant-regression (code-agent re-spawn with behavioral description of test A).
  - Emits separate warning for pre-existing-regression (test B), manifest flag set, but does NOT block the loop.
- Next round: if invariant-regression resolves and pre-existing remains, promotion proceeds with the pre-existing warning surfaced.

## Notes
Covers EC-12. Adversarial — naive impl might pick one class and ignore the other. Both must be tracked independently.
