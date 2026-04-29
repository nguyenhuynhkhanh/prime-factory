# Scenario: P-04 — Orchestrator processes only JSON from wave agents; status is authoritative

## Type
feature

## Priority
critical — FR-3 and BR-1 together: the orchestrator must not inspect prose fields or the `error` field for routing decisions; `status` alone drives pass/fail/block logic.

## Preconditions
- df-orchestrate SKILL.md has been updated per this spec
- A three-wave run is in progress: wave 1 has completed and returned a JSON summary
- The orchestrator is processing the wave 1 summary before spawning wave 2

## Action
The orchestrator receives the wave 1 JSON summary array. It routes specs for wave 2 scheduling based exclusively on the `status` field of each result object.

## Expected Outcome
- The orchestrator does NOT read any spec file during wave execution (no `Read dark-factory/specs/features/...` calls)
- The orchestrator does NOT read scenario files during wave execution
- The orchestrator uses `status: "passed"` to mark specs as completed (their dependents may proceed)
- The orchestrator uses `status: "failed"` or `"blocked"` to mark specs as failed (their transitive dependents are paused)
- The orchestrator does NOT inspect the `error` field to make routing decisions — it only uses `error` for display in the final summary
- Wave 2 is spawned without any wave 1 spec file contents in the prompt context

## Failure Mode
If the orchestrator reads spec files mid-wave or routes based on the `error` field contents, BR-1 and FR-3 are violated — the token budget guarantee is no longer provided.

## Notes
BR-1: `status` is the single authoritative signal. FR-3: orchestrator reads only JSON results during wave execution. This scenario primarily verifies the SKILL.md language directs this behavior correctly.
