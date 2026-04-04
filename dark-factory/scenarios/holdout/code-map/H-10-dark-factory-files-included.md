# Scenario: Dark Factory instruction files included in scan scope

## Type
feature

## Priority
medium -- DF files are project code that agents need to understand for self-referential analysis

## Preconditions
- Project has Dark Factory installed with:
  - .claude/agents/*.md (7 agent files)
  - .claude/skills/*/SKILL.md (7+ skill files)
  - .claude/rules/dark-factory.md
- These files reference each other (e.g., skills reference agents by path)

## Action
Scanner agent processes the .claude/ directory chunk.

## Expected Outcome
- .claude/agents/, .claude/skills/, and .claude/rules/ files are scanned
- .claude/worktrees/ is EXCLUDED (it contains temporary clones)
- Cross-references between DF files detected (e.g., df-intake references spec-agent.md)
- These appear in the Module Dependency Graph under the .claude/ directory group
- No exclusion rule accidentally skips .claude/ as a hidden directory

## Notes
Validates FR-16. The .claude/worktrees/ exclusion is in FR-14 (smart exclusions list).
