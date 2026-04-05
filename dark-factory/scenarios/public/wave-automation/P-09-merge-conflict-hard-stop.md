# Scenario: Merge conflict causes hard stop

## Type
edge-case

## Priority
critical -- merge conflicts require human judgment; auto-continuing would be dangerous

## Preconditions
- SKILL.md has been updated

## Action
Read the updated SKILL.md for merge conflict handling.

## Expected Outcome
- The SKILL.md states that merge conflicts during worktree exit cause a HARD STOP of the entire pipeline (not just the affected spec)
- The hard stop reports: which files conflict, which spec caused the conflict, which waves/specs were not yet executed
- This is explicitly distinguished from spec failures (which only block dependents, not the whole pipeline)

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-8, BR-3, and AC-10.
