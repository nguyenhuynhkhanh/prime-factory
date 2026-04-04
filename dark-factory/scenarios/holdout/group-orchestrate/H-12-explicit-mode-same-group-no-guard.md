# Scenario: Explicit mode with all specs from same group does not trigger cross-group guard

## Type
edge-case

## Priority
medium -- validates EC-13

## Preconditions
- Manifest contains:
  - `auth-schema`: group "auth", dependencies [], status "active"
  - `auth-api`: group "auth", dependencies ["auth-schema"], status "active"

## Action
Developer invokes: `/df-orchestrate auth-schema auth-api`

## Expected Outcome
- Both specs are in group "auth" -- same group
- Cross-group guard does NOT trigger (no warning, no --force required)
- Normal dependency analysis and wave execution proceeds
- Execution plan shows auth-schema in wave 1, auth-api in wave 2

## Failure Mode
If the guard triggers for same-group specs, it would unnecessarily require --force for the most common multi-spec use case.

## Notes
This validates EC-13 and BR-4.
