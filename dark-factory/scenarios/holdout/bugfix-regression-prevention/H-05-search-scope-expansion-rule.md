# Scenario: Investigator C search scope expansion only triggers for shared/core code

## Type
edge-case

## Priority
medium — Prevents unbounded codebase-wide searches for module-local bugs

## Preconditions
- `.claude/skills/df-debug/SKILL.md` exists with the updated Investigator C prompt

## Action
Read `.claude/skills/df-debug/SKILL.md` and inspect the Investigator C prompt for search scope guidance.

## Expected Outcome
- The prompt specifies the two-phase search scope:
  1. Search same module/directory as the bug first
  2. Expand to codebase-wide ONLY if the pattern is in shared/core code (utilities, middleware, base classes, shared services)
- The prompt requires the search scope to be stated in the output
- The prompt specifies that expansion is NOT the default — it requires explicit justification
- The prompt includes guidance for when NOT to expand (e.g., "If the root cause is module-local, do not search codebase-wide")

## Failure Mode
If the expansion rule is vague, Investigator C may default to codebase-wide search for every bug, producing noisy results.

## Notes
BR-3 mandates module-first search. EC-3 covers the case where expansion IS justified (bug in shared/core code with many similar patterns).
