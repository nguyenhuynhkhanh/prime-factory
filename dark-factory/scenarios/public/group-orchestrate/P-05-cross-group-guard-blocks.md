# Scenario: Cross-group guard warns and stops when explicit specs are from different groups

## Type
feature

## Priority
high -- validates the safety guard

## Preconditions
- Manifest contains:
  - `auth-api`: group "auth", dependencies [], status "active"
  - `billing-core`: group "billing", dependencies [], status "active"
- Both specs have spec files and scenario directories present

## Action
Developer invokes: `/df-orchestrate auth-api billing-core`

## Expected Outcome
- Orchestrator detects specs belong to different groups ("auth" and "billing")
- Warning displayed: "Specs belong to different groups: auth-api (auth), billing-core (billing). Use --force to proceed anyway."
- Execution stops -- no specs are orchestrated
- No manifest changes, no worktrees created

## Notes
This validates FR-3 and BR-4. The guard only applies in explicit mode.
