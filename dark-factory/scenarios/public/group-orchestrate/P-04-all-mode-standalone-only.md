# Scenario: --all mode with only standalone specs runs all in parallel

## Type
feature

## Priority
medium -- validates standalone handling in --all mode

## Preconditions
- Manifest contains 3 active specs, all standalone:
  - `fix-typo`: group null, dependencies [], status "active"
  - `add-logging`: group null, dependencies [], status "active"
  - `update-readme`: group null, dependencies [], status "active"
- All specs have spec files and scenario directories present

## Action
Developer invokes: `/df-orchestrate --all`

## Expected Outcome
- Execution plan shows all 3 as standalone, running in parallel:
  ```
  Standalone:
    fix-typo, add-logging, update-readme (all parallel)
  ```
- All 3 specs execute simultaneously in separate worktrees
- No wave ordering needed (all independent)

## Notes
This validates FR-2 and BR-2. Standalone specs (null group) are independent units.
