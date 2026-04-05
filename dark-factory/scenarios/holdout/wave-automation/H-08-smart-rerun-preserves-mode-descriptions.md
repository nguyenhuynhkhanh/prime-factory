# Scenario: Smart re-run section preserves mode descriptions for documentation

## Type
regression

## Priority
medium -- the mode descriptions are useful documentation even if the prompt is removed

## Preconditions
- SKILL.md has been updated

## Action
Read the "Smart Re-run Detection" section of the updated SKILL.md.

## Expected Outcome
- The section still describes what "new", "test-only", and "fix" modes do (for documentation/future --rerun flag)
- The section states the DEFAULT is "new" in autonomous mode
- The interactive prompt ("ask the developer") is removed
- The check for existing results (`dark-factory/results/{name}/`) is still present (the orchestrator still detects prior results -- it just doesn't ask about them)

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-4, BR-4. Removing the prompt should not remove the mode documentation, as it will be needed when the `--rerun` flag is implemented later.
