# Scenario: No agent OTHER than promote-agent documents writing memory at runtime

## Type
information-barrier

## Priority
critical — single-writer invariant enforcement.

## Preconditions
- All agent files under `.claude/agents/` edited per the full project-memory rollout.

## Action
Structural test greps EVERY `.claude/agents/*.md` file for write operations targeting `dark-factory/memory/*`.

## Expected Outcome
- `promote-agent.md` documents writing memory (positive).
- `onboard-agent.md` documents writing memory ONLY at bootstrap (positive, fenced — handled by `project-memory-onboard` spec; this spec just checks the invariant holds across the rollout).
- Every OTHER agent (architect, code, debug, spec, test, codemap, implementation) does NOT document writing memory at runtime.
- The test uses a grep-like assertion: `readFileSync(agent).includes('Write') AND readFileSync(agent).includes('dark-factory/memory/')` in the same section — asserts this co-occurrence appears ONLY in promote-agent.md (and onboard-agent.md as the fenced exception).

## Notes
Covers BR-1, INV-TBD-a. Adversarial — catches any agent that accidentally gained a memory-write step during the project-memory rollout.
