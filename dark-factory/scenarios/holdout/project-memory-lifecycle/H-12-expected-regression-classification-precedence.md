# Scenario: Expected regression takes precedence over invariant regression when BOTH could apply

## Type
edge-case

## Priority
critical — classification order determines routing.

## Preconditions
- Spec declares `## Invariants > Modifies > INV-0003`.
- Spec touches `src/auth.js`.
- Promoted test `tests/auth-invariant.test.js` has `enforced_by: tests/auth-invariant.test.js` on INV-0003, AND its `Guards:` annotation lists `src/auth.js`.
- That test fails in Step 2.75.

## Action
test-agent classifies.

## Expected Outcome
- Both conditions technically match (Guards overlap AND INV-0003 is in Modifies).
- Per the classification order, `expected-regression` takes precedence over `invariant-regression`.
- Rationale: architect pre-approved the invariant change; the promoted test is obsolete, not the implementation.
- `class: expected-regression`, `expectedRegression: true`.
- implementation-agent does NOT loop back to code-agent.
- promote-agent will refresh the promoted test in a follow-up cycle.

## Notes
Ambiguous adversarial case — without explicit precedence, a naive impl might classify as invariant-regression (the simpler check) and incorrectly loop back to code-agent.
