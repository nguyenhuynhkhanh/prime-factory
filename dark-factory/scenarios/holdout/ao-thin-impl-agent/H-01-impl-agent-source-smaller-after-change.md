# Scenario: implementation-agent source file is smaller after this change than before

## Type
edge-case

## Priority
high — NFR-2 requires the source file to decrease in size. An increase signals that new prose was added to replace what was removed, violating the spirit of the feature.

## Preconditions
- Git history exists for `src/agents/implementation-agent.src.md`.
- The change has been committed.

## Action
Compare the byte size of `src/agents/implementation-agent.src.md` at HEAD versus its size at the commit immediately before this feature's changes.

Use: `git show HEAD~1:src/agents/implementation-agent.src.md | wc -c` (before) and `wc -c src/agents/implementation-agent.src.md` (after).

## Expected Outcome
- The current size (after this feature) is LESS than the size at the commit before this feature landed.
- The reduction is at least several hundred bytes — removing the inline read-and-forward prose should produce a measurable reduction.

## Failure Mode
If the file is larger after the change, the code-agent gold-plated the implementation by adding compensating prose. Likely cause: over-engineered error handling text or duplicated path documentation.

## Notes
Validates NFR-2. This is a git-diff-based structural assertion. It cannot be tested before the feature is implemented, hence holdout.
