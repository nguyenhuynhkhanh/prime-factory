# Scenario: model-role appears as last field in frontmatter for all agents, including implementation-agent with token-cap comment

## Type
edge-case

## Priority
medium — placement convention prevents diff noise and ensures consistency; implementation-agent has a special case (comment line in frontmatter)

## Preconditions
- All 9 agent files have been updated with `model-role`
- `implementation-agent.md` has a `# Token cap:` comment line inside its frontmatter block

## Action
For each of the 9 agent files, read the raw frontmatter block (between `---` delimiters) and verify that `model-role` is the last meaningful content line before the closing `---`.

For `implementation-agent.md` specifically:
- Read the frontmatter block
- Verify that `model-role: judge` appears after the `# Token cap:` comment line
- Verify no content follows `model-role:` before the closing `---`

## Expected Outcome
- In all 9 agents, the `model-role` line is the final non-empty line of the frontmatter block
- In `implementation-agent.md`, the order is: `name`, `description`, `tools`, `# Token cap:` comment, then `model-role: judge` — in that order, with `model-role` last

Example of correct implementation-agent frontmatter:
```
---
name: implementation-agent
description: Per-spec lifecycle — architect review, implementation, holdout validation, promotion, cleanup
tools: Read, Glob, Grep, Bash, Write, Edit, Agent
# Token cap: 5,000 (raised from 4,500 to accommodate tiering logic and summarization protocol)
model-role: judge
---
```

## Failure Mode
If `model-role` is inserted before `tools` or before the `# Token cap:` comment in implementation-agent, the placement convention is violated. No runtime failure results, but the convention is broken and future diffs will be noisier.

## Notes
EC-3 covers the implementation-agent special case. AC-8 requires last-field placement. This is a holdout scenario because it tests a structural convention, not a functional requirement — the code-agent might place the field correctly for most agents but miss the implementation-agent special case.
