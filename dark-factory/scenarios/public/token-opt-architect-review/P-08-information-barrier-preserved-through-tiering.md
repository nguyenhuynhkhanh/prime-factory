# Scenario: Tiering system creates no new pathway for architect to see scenario content

## Type
feature

## Priority
critical -- information barrier is a core pipeline invariant; any breach invalidates holdout validation

## Preconditions
- `architect-agent.md` has been updated with tiering, slim context, and round summarization logic
- Public and holdout scenarios exist for a feature under review
- Tier 1 combined architect is spawned (the new code path most likely to inadvertently expose scenarios)

## Action
Tier 1 combined architect-agent performs its review. Inspect what the architect reads and references:
- What files does it read? (spec, slim profile, slim code-map, round summary)
- What does it communicate to the spec-agent when spawning it for updates?
- Does it reference any scenario file paths?

## Expected Outcome
- Architect reads: spec file, slim context files (or full files as fallback), round summary (if N > 1)
- Architect does NOT read any file in `dark-factory/scenarios/public/` or `dark-factory/scenarios/holdout/`
- Architect does NOT mention scenario files, test coverage, or test strategy in its review output
- Architect does NOT pass scenario file paths to the spec-agent when spawning it
- The "Critical Constraints — Information Barrier — Tests" block remains in architect-agent.md unchanged
- The tier parameter passed from implementation-agent to architect-agent contains ONLY: spec name, spec path, tier value, domain (if applicable) — no scenario paths, no test content
- Round summary files contain ONLY: resolved items, open blockers (about spec quality), key decisions, next round focus — no scenario content

## Notes
Validates BR-8 (information barrier absolute), NFR-1 (tiering creates no barrier breach). The tier parameter is a new data flow point — this scenario ensures it carries no test content. The Tier 1 combined path is tested specifically because it's new code that didn't exist before this feature.
