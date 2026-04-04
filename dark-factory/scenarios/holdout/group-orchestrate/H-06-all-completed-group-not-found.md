# Scenario: --group for a group where all specs have been completed and removed

## Type
edge-case

## Priority
medium -- validates EC-2

## Preconditions
- Manifest contains no specs with group "old-feature" (all were completed and cleaned up)
- Manifest may contain other specs in different groups

## Action
Developer invokes: `/df-orchestrate --group old-feature`

## Expected Outcome
- No specs found with group "old-feature"
- Error: "No group named 'old-feature' found. Available groups: [list of existing groups]"
- If no groups exist at all: "No group named 'old-feature' found. No active groups in manifest."

## Failure Mode
If the orchestrator doesn't check for empty results, it might proceed with an empty execution plan.

## Notes
This validates EC-2. Once all specs in a group are cleaned up, the group name disappears from the manifest.
