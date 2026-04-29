# Scenario: H-10 — Interrupted run resumes correctly from manifest state; no disk persistence needed

## Type
failure-recovery

## Priority
medium — EC-9: since wave result JSON is not persisted to disk, a mid-run interruption must not corrupt manifest state; the re-run must pick up correctly from `active` entries.

## Preconditions
- A three-wave run was interrupted after wave 1 completed but before wave 2 started
- Wave 1 result: `spec-a` passed (promote-agent ran, manifest updated to `promoted`, entry removed from manifest)
- Wave 2 specs: `spec-b` (depends on spec-a) and `spec-c` (depends on spec-a) — both still `active` in manifest
- The orchestrator process was killed; no wave result JSON was persisted anywhere on disk
- The developer re-runs `/df-orchestrate --group my-group`

## Action
The developer re-runs the orchestration. The orchestrator reads `manifest.json` to determine state.

## Expected Outcome
- `spec-a` is NOT in the manifest (it was removed after promotion) — treated as "already completed (skipped)"
- `spec-b` and `spec-c` are both `active` in the manifest — they are scheduled for execution
- Since `spec-a` is absent from the manifest (satisfied dependency), `spec-b` and `spec-c` have no unsatisfied dependencies and are placed in wave 1 of the new run
- The orchestrator does not look for wave result JSON files on disk (they don't exist and are not needed)
- The execution plan shows: "spec-a: already completed (skipped)" and schedules `spec-b` and `spec-c` normally

## Failure Mode
If the orchestrator requires disk-persisted wave result JSON to determine prior-wave outcomes, the re-run fails with "wave result file not found" — a regression to a more fragile state than before this spec.

## Notes
EC-9: interrupted run re-runs from manifest. DEC-TBD-a: no disk persistence for wave result JSON. The manifest's `status: "active"` entries are the single source of truth for re-run eligibility. The existing Resume Semantics section of the SKILL.md already describes this behavior — this scenario verifies it remains correct after the JSON result changes.
