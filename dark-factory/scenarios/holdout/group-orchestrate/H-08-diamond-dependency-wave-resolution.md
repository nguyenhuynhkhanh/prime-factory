# Scenario: Diamond dependency resolves into correct waves without duplication

## Type
edge-case

## Priority
high -- validates EC-5

## Preconditions
- Manifest contains group "diamond" with:
  - `d-base`: dependencies [], status "active"
  - `d-left`: dependencies ["d-base"], status "active"
  - `d-right`: dependencies ["d-base"], status "active"
  - `d-top`: dependencies ["d-left", "d-right"], status "active"

## Action
Developer invokes: `/df-orchestrate --group diamond`

## Expected Outcome
- Wave resolution:
  ```
  Wave 1: d-base
  Wave 2: d-left, d-right (parallel)
  Wave 3: d-top (depends on both d-left and d-right)
  ```
- d-base executes exactly once (not duplicated for each dependent)
- d-top waits for BOTH d-left and d-right to complete before starting
- Total 3 waves, not 4

## Failure Mode
If the wave resolver doesn't handle convergent dependencies, d-base might run twice or d-top might start before both branches complete.

## Notes
This validates EC-5. Diamond dependencies are the classic test for topological sort correctness.
