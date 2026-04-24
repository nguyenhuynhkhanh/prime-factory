# Scenario: This spec does NOT edit files owned by other sub-specs

## Type
regression

## Priority
high — scope discipline prevents merge conflicts across the project-memory wave plan.

## Preconditions
- This spec's implementation is complete.

## Action
Structural test audits file changes against the spec's "Files You May Touch" list.

## Expected Outcome
- No edits to: `.claude/agents/onboard-agent.md`, `spec-agent.md`, `architect-agent.md`, `code-agent.md`, `debug-agent.md`, `codemap-agent.md` (and their plugin mirrors).
- No edits to: `dark-factory/memory/*.md` in source form (memory is runtime-written).
- No edits to: `dark-factory/templates/*.md` (consumers-owned or foundation-owned).
- No edits to: `.claude/rules/*.md` (foundation-owned).
- No edits to: `dark-factory/manifest.json` or `dark-factory/promoted-tests.json` directly (runtime state).
- Only edits within: the 6 agent/skill files listed in scope, their plugin mirrors, and the two test files.

## Notes
Covers AC-24, AC-25, AC-26, AC-27. Structural test greps for off-limit file edits and asserts zero. Prevents accidental scope creep that would conflict with parallel sub-specs.
