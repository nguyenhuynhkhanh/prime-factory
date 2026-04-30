# Scenario: H-01 — spec-agent tools list excludes Glob, Grep, Bash, and filesystem reads of the codebase

## Type
edge-case

## Priority
critical — a prohibition in prose is insufficient if the agent's tool list still grants codebase access. Both the instruction and the tools definition must agree.

## Preconditions
- `.claude/agents/spec-agent.md` has been updated.

## Action
Structural test performs two checks:
1. Verify the spec-agent's tool list (in the frontmatter or tools section of the agent file) does not include unrestricted Read, Glob, or Grep against the codebase. The agent should only have tools appropriate for reading project-profile.md and intent files.
2. Verify the prose instructions contain the explicit prohibition (per P-01).

Both must pass independently.

## Expected Outcome
- Tool list check: no unrestricted codebase-access tools granted to spec-agent.
- Prose check: explicit prohibition present.
- If the agent file format does not have a tool list, the prose prohibition alone is checked — but a note must be added that tool restriction should be enforced at the harness level.

## Failure Mode (if applicable)
If the tool list grants Read without restriction (implying full codebase read) while the prose says "no code access", this is a contradiction — test fails with a message identifying the inconsistency. Prose without tool constraint is a false boundary.
