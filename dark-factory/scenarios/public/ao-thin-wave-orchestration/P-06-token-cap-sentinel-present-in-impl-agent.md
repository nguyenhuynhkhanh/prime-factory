# Scenario: P-06 — Token-cap sentinel is defined in implementation-agent

## Type
feature

## Priority
high — the `token-cap` sentinel must be present as a defined status value in the implementation-agent; without it, a token-cap condition produces a generic `failed` result and the developer receives misleading guidance.

## Preconditions
- `src/agents/implementation-agent.src.md` has been updated
- `npm run build:agents` has been run, producing updated `.claude/agents/implementation-agent.md`

## Action
Read `.claude/agents/implementation-agent.md` and verify it contains the `token-cap` status sentinel definition.

## Expected Outcome
The compiled implementation-agent file contains:
- The string `"token-cap"` as a status value (in a schema definition, a bullet point, or inline in an emit step description)
- Language distinguishing `token-cap` from `failed` (it is a resource constraint, not a logic failure)
- Instructions to emit `status: "token-cap"` when the agent context hits a token limit condition

## Failure Mode
If `token-cap` is absent from the compiled agent, the sentinel cannot be emitted and the orchestrator's `token-cap` handling branch is unreachable dead code.

## Notes
FR-7: implementation-agent emits `status: "token-cap"` as a distinguishable sentinel. AC-8: `token-cap` sentinel is defined in implementation-agent.src.md and handled distinctly in df-orchestrate SKILL.md. This public scenario validates the implementation-agent side; the orchestrator handling is validated in P-04 and holdout H-03.
