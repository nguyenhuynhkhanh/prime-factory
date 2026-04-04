# Scenario: All agent and skill changes are mirrored to plugins directory

## Type
feature

## Priority
critical — Plugin mirrors are the distribution channel for target projects

## Preconditions
- Modified agent files exist in `.claude/agents/`
- Modified skill files exist in `.claude/skills/`
- Plugin mirror directories exist at `plugins/dark-factory/agents/` and `plugins/dark-factory/skills/`

## Action
Compare each modified source file against its plugin mirror:
- `.claude/agents/debug-agent.md` vs `plugins/dark-factory/agents/debug-agent.md`
- `.claude/agents/code-agent.md` vs `plugins/dark-factory/agents/code-agent.md`
- `.claude/agents/architect-agent.md` vs `plugins/dark-factory/agents/architect-agent.md`
- `.claude/agents/promote-agent.md` vs `plugins/dark-factory/agents/promote-agent.md`
- `.claude/skills/df-debug/SKILL.md` vs `plugins/dark-factory/skills/df-debug/SKILL.md`

## Expected Outcome
- All 5 plugin mirror files contain the same new sections and content as their source files
- The mirror files are identical to or consistent with the source files (accounting for any pre-existing differences like migration sections)
- No plugin mirror file is missing any of the new additions from this feature

## Notes
The plugin mirrors are currently slightly ahead of source files in some cases (debug-agent.md has migration sections). After this feature, both source and mirror should have all content from both this feature and the pre-existing migration additions.
