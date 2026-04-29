# Scenario: H-09 — `model-role-dispatch.md` stub is included without errors when `ao-pipeline-mode` not yet shipped

## Type
edge-case

## Priority
medium — validates the Phase 1 stub approach doesn't break the build or any existing agent

## Preconditions
- `src/agents/shared/model-role-dispatch.md` exists as a minimal stub (e.g., a comment noting it is reserved for quality-mode dispatch, with no table content yet)
- `ao-pipeline-mode` spec has NOT yet been implemented
- `src/agents/implementation-agent.src.md` contains `<!-- include: shared/model-role-dispatch.md -->` at the appropriate position (or the include may be omitted from the .src.md if the stub approach is deferred to Phase 2 of ao-pipeline-mode)

## Action
Run `node bin/build-agents.js`. Read `.claude/agents/implementation-agent.md`.

## Expected Outcome
- Build exits with code 0
- `implementation-agent.md` contains the stub content from `shared/model-role-dispatch.md` at the include position (or the agent is assembled without any include for this block if implementation-agent.src.md uses no dispatch include yet)
- No error about missing shared file
- The stub content does not break any existing test assertions about implementation-agent

## Failure Mode (if applicable)
N/A.

## Notes
Exercises BR-4. Two acceptable implementations: (1) `implementation-agent.src.md` includes a minimal stub for `model-role-dispatch.md` — the stub content is inert; (2) `implementation-agent.src.md` has NO include for this block and the block will be added when `ao-pipeline-mode` ships. Either approach must pass this scenario as long as the build succeeds and `implementation-agent.md` remains functionally equivalent to its current form.
