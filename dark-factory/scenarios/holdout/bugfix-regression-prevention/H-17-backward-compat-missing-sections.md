# Scenario: Consumers handle absence of new debug report sections gracefully (backward compat)

## Type
regression

## Priority
critical — In-flight bugfixes must not break when the pipeline is updated

## Preconditions
- Modified agent files exist (code-agent, architect-agent, promote-agent)
- A hypothetical in-flight bugfix has a debug report in the OLD format (without Systemic Analysis, Regression Risk Assessment, Root Cause Depth sections)

## Action
Verify that each consumer of the debug report handles absent new sections:
1. Read `.claude/agents/code-agent.md` — check what happens when Regression Risk Assessment is missing
2. Read `.claude/agents/architect-agent.md` — check what happens when Systemic Analysis and Regression Risk are missing
3. Read `.claude/agents/promote-agent.md` — check what happens when root cause data is missing

## Expected Outcome
- **Code-agent**: When Regression Risk Assessment is missing, defaults to writing just the reproduction test (no variants). Does not error or block.
- **Architect-agent**: When Systemic Analysis and Regression Risk are missing, proceeds with review using existing criteria. May note the absence as a concern but does not BLOCK solely for missing sections.
- **Promote-agent**: When root cause data is missing, uses fallback annotation format. Does not block promotion.
- No agent treats missing new sections as an error condition
- The pipeline continues to function for in-flight bugfixes started before this feature

## Failure Mode
If any agent treats the missing sections as required (not optional), in-flight bugfixes will fail at that pipeline stage.

## Notes
EC-1 and NFR-1 cover this. The debug report is a shared contract — new sections must be additive and optional for backward compatibility.
