# Scenario: --all mode with only standalone specs (no groups at all)

## Type
edge-case

## Priority
medium -- validates EC-14

## Preconditions
- Manifest contains 4 active specs, all with group: null or missing group field:
  - `fix-a`: group null, dependencies [], status "active"
  - `fix-b`: dependencies [], status "active" (group field missing)
  - `fix-c`: group null, dependencies [], status "active"
  - `fix-d`: group null, dependencies [], status "active"

## Action
Developer invokes: `/df-orchestrate --all`

## Expected Outcome
- No groups found -- all specs are standalone
- Execution plan:
  ```
  Standalone:
    fix-a, fix-b, fix-c, fix-d (all parallel)
  ```
- All 4 run in parallel
- No wave ordering needed
- No "groups" section in the execution plan

## Failure Mode
If the orchestrator requires at least one group or fails when no groups exist, standalone-only manifests would break.

## Notes
This validates EC-14. The common case for projects that don't use spec decomposition.
