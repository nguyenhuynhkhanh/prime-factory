# Scenario: Two promote-agents append to registry without data loss

## Type
concurrency

## Priority
high — parallel worktrees can promote simultaneously

## Preconditions
- `dark-factory/promoted-tests.json` exists with 1 entry
- Two promote-agents finish simultaneously (from parallel worktrees for `feature-a` and `feature-b`)

## Action
Both promote-agents attempt to append to the registry

## Expected Outcome
- After both complete, the registry has 3 entries (1 original + 2 new)
- No entry is lost or corrupted
- File is valid JSON

## Failure Mode
If both agents read the file at the same time, write back with their addition only, the last write wins and one entry is lost. The implementation should use read-then-write atomically, or each worktree writes to a separate registry that gets merged on worktree exit.

## Notes
BR-3: Registry is append-only. In practice, parallel worktrees merge branches sequentially, so this is handled by git merge. But the scenario verifies the data survives the merge.
