# Scenario: Multi-file Guards annotation with PARTIAL overlap → invariant-regression

## Type
edge-case

## Priority
critical — the most subtle classification case.

## Preconditions
- Spec touches files: `src/auth.js`, `src/user.js`.
- Promoted test's `Guards:` annotation: `src/auth.js:42, src/billing.js:17, src/notifications.js:88`.
- Promoted test fails in Step 2.75.

## Action
test-agent classifies.

## Expected Outcome
- Guards overlap with touched files = ["src/auth.js"] (NON-EMPTY).
- Classification: `invariant-regression` (ANY overlap counts, not all).
- Behavioral description includes a pointer to the specific overlapping file: "Failing promoted test guards src/auth.js; this feature modified src/auth.js".
- Routes to code-agent loop.

## Notes
Adversarial — naive impl might require FULL overlap (all Guards files must be touched) and misclassify as pre-existing. Test feeds partial overlap and asserts invariant-regression.
