# Scenario: H-02 — Wave agent crashes with partial results (some specs reported, some not)

## Type
failure-recovery

## Priority
critical — a partial wave result is the hardest failure mode to handle correctly; the orchestrator must not promote specs that weren't explicitly reported as passed, but must not throw away results that were reported.

## Preconditions
- A wave contains four specs: `spec-a`, `spec-b`, `spec-c`, `spec-d`
- The wave agent crashes mid-execution (simulated by wave agent returning a partial array)
- The partial result contains only: `spec-a` (passed) and `spec-b` (failed)
- `spec-c` and `spec-d` are absent from the result — their implementation-agents may or may not have completed

## Action
The orchestrator receives the partial wave result array containing only `spec-a` and `spec-b` results. It must determine what happened to `spec-c` and `spec-d`.

## Expected Outcome
- `spec-a` is processed normally: `status: "passed"`, promoted
- `spec-b` is processed normally: `status: "failed"`, dependents blocked
- `spec-c` is treated as `status: "failed"` with `error: "wave-agent-crash"` — it was not reported, so it is not promoted
- `spec-d` is treated as `status: "failed"` with `error: "wave-agent-crash"`
- All four specs are reported in the final summary: 1 passed, 3 failed (1 explicit, 2 crash-inferred)
- The final summary includes: "Wave agent crash detected — specs spec-c, spec-d treated as failed. Check their worktrees."

## Failure Mode
If the orchestrator treats absent-from-result specs as "implicitly passed" (best-case assumption), it may report promotion paths for specs that never completed, corrupting the pipeline state.

## Notes
FR-6: partial wave results — valid results processed normally, missing specs treated as `error: "wave-agent-crash"`. BR-6: wave agent crash with partial results. The manifest for `spec-c` and `spec-d` remains `status: "active"` since they were never promoted or cleaned up — a re-run will pick them up correctly.
