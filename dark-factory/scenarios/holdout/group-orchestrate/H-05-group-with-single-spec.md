# Scenario: --group with only one spec in the group works like single-spec mode

## Type
edge-case

## Priority
medium -- validates EC-1

## Preconditions
- Manifest contains:
  - `tiny-feature`: group "tiny", dependencies [], status "active"
- No other specs in group "tiny"

## Action
Developer invokes: `/df-orchestrate --group tiny`

## Expected Outcome
- Execution plan:
  ```
  Group: tiny
  Wave 1: tiny-feature
  ```
- Single spec executes normally through full orchestration cycle
- Behavior is identical to `/df-orchestrate tiny-feature`

## Notes
This validates EC-1. A group of one should not cause edge-case failures.
