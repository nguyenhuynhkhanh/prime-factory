# Scenario: code-agent documents self-loading from specPath, publicScenariosDir, architectFindingsPath

## Type
feature

## Priority
critical — code-agent's self-load instructions are the other side of the handoff contract. If code-agent does not know it must self-load, it will operate without spec or scenario context.

## Preconditions
- `src/agents/code-agent.src.md` (or compiled `code-agent.md`) has been modified per this spec.

## Action
Read `.claude/agents/code-agent.md`. Inspect the "Your Inputs" section and the "Feature Mode" section.

## Expected Outcome
- The agent text describes reading the spec from `specPath` (or the path provided in the spawn brief under that key).
- The agent text describes globbing and reading all scenario files from `publicScenariosDir`.
- The agent text describes reading architect findings from `architectFindingsPath`.
- The agent text or a NEVER rule states that it must use the explicit `publicScenariosDir` path, not a broad glob of `dark-factory/scenarios/`.
- The agent text describes handling a missing findings file gracefully (log and continue).

## Notes
Validates FR-4, FR-5, FR-6, AC-4, AC-5. This scenario tests the compiled output (code-agent.md), not just the source, since the compiled output is what actually runs.
