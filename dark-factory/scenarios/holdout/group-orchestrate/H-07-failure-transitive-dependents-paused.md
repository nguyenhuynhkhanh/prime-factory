# Scenario: Failure pauses transitive dependents, not just direct dependents

## Type
failure-recovery

## Priority
critical -- validates transitive failure propagation

## Preconditions
- Manifest contains group "deep" with:
  - `deep-core`: dependencies [], status "active"
  - `deep-mid`: dependencies ["deep-core"], status "active"
  - `deep-leaf`: dependencies ["deep-mid"], status "active"
  - `deep-side`: dependencies ["deep-core"], status "active"

## Action
1. Developer invokes: `/df-orchestrate --group deep`
2. Wave 1: deep-core completes successfully
3. Wave 2: deep-mid and deep-side run in parallel
4. deep-mid FAILS (implementation fails after 3 rounds)
5. deep-side SUCCEEDS

## Expected Outcome
- deep-leaf is paused (transitive dependent: deep-leaf -> deep-mid -> deep-core, and deep-mid failed)
- deep-side succeeded independently
- Report:
  ```
  Completed: deep-core, deep-side
  Failed: deep-mid (implementation failed after 3 rounds)
  Blocked (transitive dependency on failed spec): deep-leaf
  ```
- deep-leaf was never attempted, even though deep-core (its grandparent) succeeded

## Failure Mode
If only direct dependents are paused, deep-leaf might be attempted and fail in confusing ways because deep-mid's changes are missing.

## Notes
This validates BR-5 and EC-6. Failure isolation must be transitive.
