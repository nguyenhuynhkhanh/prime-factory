# Scenario: Two specs in the same wave both introduce invariants → sequential IDs

## Type
concurrency

## Priority
critical — the single-writer serialization guarantee.

## Preconditions
- Wave 2 contains two specs: spec-a and spec-b, each declaring `INV-TBD-a` (different semantics, same placeholder name).
- Both implementation-agents run in parallel in their own worktrees.
- Each spec-a / spec-b's code-agents complete and tests pass concurrently.

## Action
Each implementation-agent spawns promote-agent at the end of its lifecycle. promote-agent invocations are serialized (df-orchestrate wave semantics).

## Expected Outcome
- Whichever promote-agent runs first: sees current max INV-NNNN; assigns next (e.g., INV-0005).
- The second promote-agent: re-reads memory (BR-11); sees INV-0005 just written; assigns INV-0006.
- No ID collision.
- Each spec's `INV-TBD-a` gets a distinct permanent ID.
- Documented in promote-agent.md or the wave-execution narrative of df-orchestrate.md.

## Notes
Covers BR-12, EC-5, INV-TBD-a. The mitigation depends on serialized promote invocations. Structural test asserts promote-agent.md documents the re-read-before-commit behavior AND df-orchestrate.md documents wave-serialized promote-agent invocations.
