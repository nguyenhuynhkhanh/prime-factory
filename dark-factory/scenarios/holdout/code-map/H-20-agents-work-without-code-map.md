# Scenario: Agents still work correctly when code-map.md does not exist

## Type
edge-case

## Priority
critical -- backward compatibility; existing projects without code maps must not break

## Preconditions
- Project has project-profile.md but NO code-map.md (onboarded before this feature)
- A feature intake is triggered with `/df-intake`
- All 6 consuming agents are spawned during the pipeline

## Action
Each consuming agent (spec, architect, code, debug, test, promote) starts its process and looks for code-map.md.

## Expected Outcome
- No agent crashes or errors when code-map.md is not found
- Each agent proceeds with its normal workflow (profile-only context)
- No "file not found" errors in agent output
- The conditional guard ("if code-map.md exists") in each agent's instructions prevents any read attempt on a missing file
- Pipeline completes successfully without code map

## Notes
Cross-feature scenario: validates backward compatibility. This is the most important holdout -- it ensures the feature is purely additive and does not break existing workflows.
