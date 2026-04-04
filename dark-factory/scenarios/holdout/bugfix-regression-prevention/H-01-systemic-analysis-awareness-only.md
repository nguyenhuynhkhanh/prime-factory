# Scenario: Systemic Analysis similar patterns are listed for awareness only, not auto-fixed

## Type
edge-case

## Priority
high — Prevents scope creep where the debug-agent or code-agent tries to fix similar patterns as part of the bugfix

## Preconditions
- `.claude/agents/debug-agent.md` exists with the updated debug report template

## Action
Read `.claude/agents/debug-agent.md` and inspect the Systemic Analysis section of the debug report template.

## Expected Outcome
- The Systemic Analysis section explicitly states that similar patterns are listed for awareness only
- The section states that the developer decides whether to fix similar patterns as separate features
- The section does NOT instruct or imply that the code-agent should fix similar patterns
- The section does NOT instruct the architect to demand fixing similar patterns

## Failure Mode
If the awareness-only constraint is missing, similar patterns could be interpreted as part of the fix scope, causing unbounded work.

## Notes
BR-1 mandates this. The developer-confirmed scope decision is that similar patterns are "listed for awareness only, developer decides whether to fix as separate feature."
