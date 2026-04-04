# Scenario: Cross-group guard bypassed with --force

## Type
feature

## Priority
high -- validates --force override

## Preconditions
- Manifest contains:
  - `auth-api`: group "auth", dependencies [], status "active"
  - `billing-core`: group "billing", dependencies [], status "active"
- Both specs have spec files and scenario directories present

## Action
Developer invokes: `/df-orchestrate auth-api billing-core --force`

## Expected Outcome
- Orchestrator detects cross-group specs but --force is present
- Proceeds with execution (treats named specs as an ad-hoc batch)
- Normal dependency analysis and wave execution for the named specs
- No cross-group guard warning blocks execution

## Notes
This validates FR-3. The --force flag explicitly overrides the cross-group safety check.
