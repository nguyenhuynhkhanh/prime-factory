# Scenario: Best-of-N mode — both parallel tracks receive identical path parameters and self-load independently

## Type
concurrency

## Priority
medium — Best-of-N is a quality-mode + Tier 3 specific path. Incorrect behavior here affects high-stakes implementations only, but the consequence (one track getting stale or wrong context) is serious.

## Preconditions
- `src/agents/implementation-agent.src.md` has been modified per this spec.
- The Best-of-N section (quality mode + Tier 3) describes code-agent spawn for track-a and track-b.

## Action
Read `src/agents/implementation-agent.src.md`. Inspect the Best-of-N section. Examine the spawn brief for track-a and track-b code-agents.

## Expected Outcome
- Both track-a and track-b spawns pass the same `specPath`, `publicScenariosDir`, and `architectFindingsPath` values.
- Neither track receives inline spec content or inline scenario content.
- The spec mentions or implies that both tracks self-load independently from the same paths (concurrent read-only access to shared files is safe).
- There is no language suggesting track-b receives track-a's loaded content or vice versa.

## Notes
Validates EC-2. Holdout because the code-agent may correctly update Step 1 (single-track) but overlook the Best-of-N parallel spawn section.
