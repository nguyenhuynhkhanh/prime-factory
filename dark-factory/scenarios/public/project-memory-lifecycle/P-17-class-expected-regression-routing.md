# Scenario: expected-regression class does NOT loop back to code-agent

## Type
feature

## Priority
critical — supports legitimate invariant evolution.

## Preconditions
- Spec declares `## Invariants > Modifies > INV-0003` (architect pre-approved the invariant change).
- Promoted test `tests/some-test.js` has `enforced_by: tests/some-test.js` on INV-0003 (i.e., this is the test that enforces INV-0003).
- That test fails in Step 2.75.
- test-agent.md and implementation-agent.md edited.

## Action
Read test-agent.md and implementation-agent.md.

## Expected Outcome
- test-agent matches the failing test's path against the `enforced_by` field of INV-0003, finds it, and notes that this spec's `## Invariants > Modifies` declares INV-0003.
- test-agent classifies as `class: expected-regression`.
- test-agent sets `expectedRegression: true` in structured output.
- implementation-agent emits an INFO note: "Expected regression: promoted test {path} enforces INV-0003 which this spec declares Modifies. Proceeding; promoted test will be updated at promotion."
- implementation-agent sets manifest `expectedRegression: true`.
- implementation-agent does NOT loop back to code-agent.
- implementation-agent PROCEEDS with promotion; promote-agent is expected to refresh the promoted test in a follow-up step (mechanism deferred).

## Notes
Covers BR-5, EC-11. The four classes are mutually exclusive and evaluated in order; expected-regression takes precedence over invariant-regression when both conditions apply.
