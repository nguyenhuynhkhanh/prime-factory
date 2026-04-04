# Scenario: Failed spec pauses its dependents but independent specs continue

## Type
failure-recovery

## Priority
critical -- validates failure isolation

## Preconditions
- Manifest contains group "platform" with 4 specs:
  - `platform-core`: dependencies [], status "active"
  - `platform-auth`: dependencies ["platform-core"], status "active"
  - `platform-billing`: dependencies ["platform-core"], status "active"
  - `platform-reports`: dependencies ["platform-billing"], status "active"

## Action
1. Developer invokes: `/df-orchestrate --group platform`
2. Wave 1 (platform-core) completes successfully
3. Wave 2 starts: platform-auth and platform-billing run in parallel
4. platform-auth SUCCEEDS
5. platform-billing FAILS (architect blocks it)

## Expected Outcome
- platform-billing is marked as failed
- platform-reports (depends on platform-billing) is paused -- not attempted
- platform-auth already succeeded (independent of platform-billing)
- After all executable specs finish, report to developer:
  ```
  Completed: platform-core, platform-auth
  Failed: platform-billing (architect BLOCKED)
  Blocked (dependency on failed spec): platform-reports
  ```
- Developer is asked to decide next steps (not auto-retry)
- Failed and blocked specs remain status "active" in manifest

## Notes
This validates FR-5 and BR-5. Failure isolation maximizes progress.
