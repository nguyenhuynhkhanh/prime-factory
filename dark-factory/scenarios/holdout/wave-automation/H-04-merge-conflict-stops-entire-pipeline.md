# Scenario: Merge conflict stops entire pipeline, not just the spec

## Type
edge-case

## Priority
critical -- merge conflicts are the one case where partial continuation is dangerous

## Preconditions
- SKILL.md has been updated

## Action
Read the merge conflict handling in the updated SKILL.md. Verify it is a HARD STOP.

## Expected Outcome
- When a merge conflict occurs during worktree exit, the ENTIRE pipeline stops immediately
- This is explicitly different from spec failures (which only block dependents)
- The hard stop reports: which files conflict, which spec was being merged, which waves/specs were not yet executed
- The SKILL.md does NOT say "block dependents and continue" for merge conflicts -- it says "hard stop" or "stop the entire pipeline"
- Remaining waves are NOT executed after a merge conflict

## Failure Mode
N/A -- content assertion

## Notes
Validates BR-3. A merge conflict means two specs modified the same file, which means the dependency analysis was wrong. Continuing would compound the error.
