# Scenario: Smart re-run detection defaults to "new" without prompting

## Type
feature

## Priority
high -- removing this pause point is part of the 4-pause removal

## Preconditions
- SKILL.md has been updated

## Action
Read the "Smart Re-run Detection" section of the updated SKILL.md.

## Expected Outcome
- The section states that when previous results exist, the default behavior is "new" (wipe results, full run)
- The section does NOT contain language like "ask the developer" or interactive prompts for choosing new/test-only/fix
- The section may mention that the developer can override this default via a future `--rerun` flag, but the default is autonomous "new"

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-4, BR-4, and AC-7.
