# Scenario: --all mode with groups of different wave depths runs independently

## Type
feature

## Priority
high -- validates EC-12 cross-group parallelism

## Preconditions
- Manifest contains:
  - Group "shallow": 2 specs
    - `shallow-a`: dependencies [], status "active"
    - `shallow-b`: dependencies ["shallow-a"], status "active"
  - Group "deep": 4 specs
    - `deep-a`: dependencies [], status "active"
    - `deep-b`: dependencies ["deep-a"], status "active"
    - `deep-c`: dependencies ["deep-b"], status "active"
    - `deep-d`: dependencies ["deep-c"], status "active"

## Action
Developer invokes: `/df-orchestrate --all`

## Expected Outcome
- Both groups start simultaneously
- shallow-a and deep-a run in parallel (wave 1 of each group)
- After shallow-a completes, shallow-b starts (group "shallow" wave 2)
- After shallow-b completes, group "shallow" is done -- it does NOT wait for group "deep"
- Group "deep" continues through waves 2, 3, 4 independently
- Total wall-clock time determined by the slowest group (deep), not by sequential execution

## Failure Mode
If groups are serialized, the total time would be sum of both groups instead of max.

## Notes
This validates EC-12. Groups must be truly independent -- one finishing early doesn't block on the other.
