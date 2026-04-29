# Scenario: multiple parallel tracks (medium/large spec) all receive same paths; concurrent read is safe

## Type
concurrency

## Priority
medium — medium and large specs spawn 2-3 code-agents in parallel. If the spawn brief includes inline content, it inflates implementation-agent's context multiplicatively. Path-passing fixes this.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.
- The Multiple Tracks section (Step 1) describes parallel code-agent spawn with worktree isolation.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect the "Multiple tracks" spawn section (inside Step 1, Feature Mode).

## Expected Outcome
- The multiple-tracks spawn brief passes `specPath`, `publicScenariosDir`, and `architectFindingsPath` (not inline content) to each track.
- The spec or a note makes clear that each track independently reads from the same paths — no shared mutable state is involved since the paths point to read-only files during implementation.
- The language does NOT include "full spec, all public scenarios" as inline content passed to each track (the old pattern would multiply the token cost by the number of tracks).

## Notes
Validates EC-4. This is a medium-stakes concurrency check — read-only file access by multiple agents is inherently safe, but the spec must reflect this correctly.
