# Scenario: holdout-barrier shared block is unchanged after this feature lands

## Type
feature

## Priority
critical — the holdout barrier is the primary information isolation mechanism for the entire pipeline. Weakening it even slightly breaks test validity for all features.

## Preconditions
- `src/agents/shared/holdout-barrier.md` exists.
- This feature's changes to implementation-agent.src.md and code-agent.src.md have been applied.
- `npm run build:agents` has been run.

## Action
Read `src/agents/shared/holdout-barrier.md`. Compare its content against the expected canonical text:
```
- NEVER read `dark-factory/scenarios/holdout/` from previous features (isolation)
```

Also read compiled `.claude/agents/code-agent.md` and verify the holdout barrier rule is present exactly as compiled from the shared block.

## Expected Outcome
- `src/agents/shared/holdout-barrier.md` contains exactly the same text as before this feature landed.
- The compiled `code-agent.md` still contains the holdout barrier rule.
- No `<!-- include: shared/holdout-barrier.md -->` directive appears unresolved in any compiled output.

## Notes
Validates NFR-3, AC-10. The holdout barrier is the foundation of the pipeline's test integrity. This scenario confirms the feature is additive (new path-passing rules) rather than modifying (removing or weakening existing barrier rules).
