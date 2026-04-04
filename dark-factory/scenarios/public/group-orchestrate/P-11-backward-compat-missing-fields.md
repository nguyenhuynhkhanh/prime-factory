# Scenario: Legacy manifest entries without group/dependencies fields work correctly

## Type
edge-case

## Priority
high -- validates backward compatibility

## Preconditions
- Manifest contains a legacy entry (like the current pipeline-velocity):
  ```json
  {
    "pipeline-velocity": {
      "type": "feature",
      "status": "active",
      "specPath": "dark-factory/specs/features/pipeline-velocity.spec.md",
      "created": "2026-03-22T03:45:00.000Z",
      "rounds": 0
    }
  }
  ```
- Note: no `group` or `dependencies` fields

## Action
Developer invokes: `/df-orchestrate --all`

## Expected Outcome
- Orchestrator reads pipeline-velocity entry
- Missing `group` treated as `null` (standalone)
- Missing `dependencies` treated as `[]` (no dependencies)
- pipeline-velocity appears as a standalone spec in the execution plan
- Execution proceeds normally
- No error or warning about missing fields

## Notes
This validates FR-7 and EC-8. Backward compatibility is critical for existing in-flight features.
