# Scenario: pre-existing-regression class warns + proceeds (does NOT block)

## Type
feature

## Priority
critical — prevents "flaky old test halts the whole shop" failure mode.

## Preconditions
- test-agent.md and implementation-agent.md edited.
- A promoted test fails whose `Guards:` annotation references ZERO files this spec touched.

## Action
Read test-agent.md and implementation-agent.md.

## Expected Outcome
- test-agent classifies as `class: pre-existing-regression`.
- test-agent sets `preExistingRegression: true` in structured output.
- implementation-agent emits a LOUD warning naming the failing promoted test and its owning feature (from annotation).
- implementation-agent suggests `/df-debug {owning-feature}` to investigate separately.
- implementation-agent sets manifest `preExistingRegression: true` for this spec.
- implementation-agent PROCEEDS with promotion (does NOT loop back to code-agent, does NOT block).

## Notes
Covers BR-4, FR-14 class 3, FR-20. Critical for pipeline resilience.
