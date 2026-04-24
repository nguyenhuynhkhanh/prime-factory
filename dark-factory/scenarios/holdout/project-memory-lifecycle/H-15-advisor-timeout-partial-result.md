# Scenario: Advisor timeout returns partial structured result, spec-agent proceeds

## Type
failure-recovery

## Priority
high — bounded latency guarantee.

## Preconditions
- test-agent.md edited.
- df-intake/SKILL.md edited.
- Advisor is slow (takes > 60s).

## Action
Advisor returns `{ status: "timeout", partial: { feasibility: [...], flakiness: [] } }` (some categories completed, others not).

## Expected Outcome
- test-agent.md documents that timeout returns partial results, not nothing.
- spec-agent reads the partial; uses the completed categories; ignores the empty ones.
- df-intake emits warning "Testability advisor timeout — using partial results" (or equivalent).
- Manifest `testAdvisoryCompleted: false` is set.
- Intake PROCEEDS; no retry.
- No developer prompt; no blocking.

## Notes
Adversarial — naive impl might treat timeout as "no data" and discard partials. Partial-result consumption is more useful than throwing away completed work.
