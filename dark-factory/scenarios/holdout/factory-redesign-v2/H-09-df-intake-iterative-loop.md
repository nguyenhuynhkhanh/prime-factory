# Scenario: H-09 — df-intake skill describes iterative draft loop matching spec-agent behavior

## Type
edge-case

## Priority
high — the spec-agent instructions and the df-intake skill must align. If df-intake still describes a single-pass spec generation, the skill drives the wrong behavior regardless of what spec-agent.md says.

## Preconditions
- `.claude/skills/df-intake/SKILL.md` has been updated for this feature.
- `plugins/dark-factory/skills/df-intake/SKILL.md` has been mirrored.

## Action
Structural test verifies that `.claude/skills/df-intake/SKILL.md` describes:
1. The spec-agent produces a draft on first input (not a complete spec).
2. The draft is shown to the developer immediately.
3. The loop continues until developer confirms.
4. Max 3 questions per round is referenced.

All four behaviors must appear in the skill description — they are the behaviors the harness drives.

## Expected Outcome
- All four behaviors documented in df-intake SKILL.md.
- Plugin mirror matches.

## Failure Mode (if applicable)
If df-intake SKILL.md describes spawning a spec-agent and waiting for a complete spec, it contradicts the iterative model. This is the most likely implementation drift point — the skill is what the harness runs, not just the agent instructions.
