# Scenario: --group mode runs independent specs in the same wave in parallel

## Type
feature

## Priority
high -- validates parallelism within waves

## Preconditions
- Manifest contains 3 specs in group "payments":
  - `payments-schema`: group "payments", dependencies [], status "active"
  - `payments-api`: group "payments", dependencies ["payments-schema"], status "active"
  - `payments-webhooks`: group "payments", dependencies ["payments-schema"], status "active"
- All specs have spec files and scenario directories present

## Action
Developer invokes: `/df-orchestrate --group payments`

## Expected Outcome
- Execution plan displayed:
  ```
  Group: payments
  Wave 1: payments-schema
  Wave 2: payments-api, payments-webhooks (parallel -- both depend only on payments-schema)
  ```
- Wave 1 executes payments-schema in its own worktree
- After wave 1 completes, wave 2 spawns payments-api and payments-webhooks in parallel worktrees
- Both wave 2 specs run simultaneously

## Notes
This validates FR-1, FR-10, and the wave-based parallelism within a group.
