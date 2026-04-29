# Scenario: H-04 — All specs in a wave fail; orchestrator collects all results before blocking and continues independent specs

## Type
edge-case

## Priority
high — FR-8 requires collecting all results before computing blocking; EC-2 verifies the "all fail" path does not cause early abort of unrelated waves.

## Preconditions
- Three-wave run: wave 1 contains `spec-a` (no dependencies), wave 2 contains `spec-b` (depends on spec-a) and `spec-c` (depends on spec-a), wave 3 contains `spec-d` (independent, no group dependency on spec-a chain)
- Wave 1 runs: both `spec-a` fails
- The manifest has `spec-d` in a different group with no dependency on spec-a

## Action
Wave 1 completes. The orchestrator receives `[{"specName": "spec-a", "status": "failed", "error": "architect-blocked"}]`. It processes this before spawning wave 2.

## Expected Outcome
- The orchestrator collects the wave 1 result completely before evaluating wave 2 eligibility
- `spec-b` and `spec-c` (which depend on `spec-a`) are marked as blocked — they are NOT run in wave 2
- `spec-d` (independent) is run normally, either in the same pass or as part of its own wave
- The orchestrator does NOT abort the entire run because wave 1 had a failure
- The final summary shows: `spec-a: failed`, `spec-b: blocked by spec-a`, `spec-c: blocked by spec-a`, `spec-d: [its actual outcome]`
- The progress message between waves is non-blocking: "Wave 1 complete (spec-a: failed). Starting next pass..."

## Failure Mode
If the orchestrator exits early when a wave fails, `spec-d` is never run — this is the "early abort" anti-pattern that this spec explicitly prohibits.

## Notes
FR-8: orchestrator collects all wave results before computing blocking. EC-2: all specs in a wave fail — independent specs in other waves continue. The existing "Continue independent specs" rule in the SKILL.md Failure Handling section must be preserved and compatible with JSON result processing.
