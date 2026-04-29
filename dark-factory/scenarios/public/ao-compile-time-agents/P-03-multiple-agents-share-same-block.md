# Scenario: P-03 — Multiple agents including the same shared block all get the same resolved text

## Type
feature

## Priority
high — the core anti-drift guarantee: all consumers of a shared block get the same content

## Preconditions
- `src/agents/shared/context-loading.md` contains the canonical code-map orientation text
- The following agents each have `<!-- include: shared/context-loading.md -->` in their `.src.md` files: spec-agent, debug-agent, architect-agent, promote-agent, test-agent, code-agent
- Build has run successfully

## Action
Read `.claude/agents/spec-agent.md`, `.claude/agents/debug-agent.md`, `.claude/agents/architect-agent.md`, `.claude/agents/promote-agent.md`, `.claude/agents/test-agent.md`, `.claude/agents/code-agent.md`. Extract the code-map orientation paragraph from each.

## Expected Outcome
- All 6 agents contain the canonical code-map orientation text from `shared/context-loading.md`
- The text is byte-for-byte identical across all 6 agents (no variation in the shared portion)
- Previously-drifted copies (test-agent had abbreviated form, code-agent was missing `DO use Read/Grep`) now match the canonical form

## Failure Mode (if applicable)
N/A.

## Notes
This is the primary regression-prevention scenario. If any two agents diverge on the shared block content, this scenario fails. Exercises EC-6 (two agents including the same file) and DEC-TBD-a.
