# Scenario: Wave agents spawned as independent agents

## Type
feature

## Priority
critical -- the architectural change from inline execution to wave agent spawning is the core of this feature

## Preconditions
- SKILL.md has been updated with the high-level orchestrator / wave agent architecture

## Action
Read the updated `df-orchestrate/SKILL.md`. Verify the wave agent spawning pattern.

## Expected Outcome
- The SKILL.md describes a high-level orchestrator that ONLY coordinates (reads manifest, resolves waves, spawns wave agents, reads results, produces summary)
- The SKILL.md describes spawning each wave as an independent agent (Agent tool) that receives: spec names for the wave, branch/worktree context, and mode
- The wave agent description states it handles the FULL lifecycle: architect review, code agents, holdout validation, promotion, cleanup
- The high-level orchestrator does NOT contain inline architect review, code agent, or test agent spawning for multi-spec runs
- The orchestrator waits for each wave agent to complete before spawning the next wave agent
- After a wave agent completes, the orchestrator updates the manifest and checks for failures before proceeding

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-1, FR-2, BR-5. The key distinction is: for multi-spec runs, the orchestrator delegates to wave agents. For single-spec runs, existing inline behavior is preserved (see P-10).
