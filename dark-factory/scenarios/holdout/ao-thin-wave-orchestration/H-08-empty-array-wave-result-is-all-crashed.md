# Scenario: H-08 — Wave agent returns empty array; treated as all-crashed for that wave

## Type
edge-case

## Priority
high — EC-4: an empty array `[]` is not a valid "all succeeded" response; the orchestrator must not silently promote specs that produced no result.

## Preconditions
- A wave contains three specs: `spec-x`, `spec-y`, `spec-z`
- The wave agent returns an empty JSON array `[]` — not a parse error, not a crash, just an empty array
- This could happen if the wave agent started all implementation-agents but crashed before collecting any results

## Action
The orchestrator receives `[]` from the wave agent.

## Expected Outcome
- The orchestrator does NOT treat this as "all passed" or "nothing to report"
- All three specs (`spec-x`, `spec-y`, `spec-z`) are treated as `status: "failed"` with `error: "wave-agent-crash"`
- Their transitive dependents are blocked
- The final summary shows all three as failed with the crash error
- A warning is logged: "Wave returned empty result array — all specs in this wave treated as wave-agent-crash."

## Failure Mode
If the orchestrator treats `[]` as "wave completed successfully with no errors," it silently marks specs as complete without promoting them, leaving manifest entries as `active` but with no test promotion. The next `df-cleanup` or `df-orchestrate` run would try to re-run them, potentially causing double-work or confusion.

## Notes
EC-4: empty array response is all-crashed, not all-succeeded. BR-6: wave agent crash with no result → all specs in wave treated as failed. The orchestrator's handling of `[]` must be a safe default (pessimistic, not optimistic).
