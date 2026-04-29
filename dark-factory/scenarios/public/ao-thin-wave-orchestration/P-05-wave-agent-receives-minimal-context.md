# Scenario: P-05 — Wave agent is spawned fresh with minimal context (no spec prose, no prior-wave carryover)

## Type
feature

## Priority
high — wave freshness is the mechanism that prevents context bloat; if carryover is allowed, the original problem (orchestrator context degradation) migrates from the orchestrator into wave agents.

## Preconditions
- df-orchestrate SKILL.md has been updated per this spec
- A three-wave run is in progress: waves 1 and 2 have completed
- Wave 3 is about to be spawned

## Action
Inspect the prompt context passed to the wave 3 agent spawn call. Specifically: what information does the orchestrator include?

## Expected Outcome
The wave 3 agent is spawned with ONLY:
- List of spec names for wave 3 (e.g., `["spec-gamma", "spec-delta"]`)
- Spec paths for wave 3 (e.g., `["dark-factory/specs/features/spec-gamma.spec.md", ...]`) — as identifiers, not file contents
- Branch name
- Pipeline mode value (e.g., `"balanced"`)
- AFK flag value

The wave 3 agent context does NOT contain:
- Contents of any spec file from wave 1, wave 2, or wave 3
- Any scenario file contents
- Wave 1 or wave 2 JSON summaries (the orchestrator retains these internally but does not forward them to the new wave)
- Any narrative summary of prior wave outcomes

## Failure Mode
If the orchestrator passes prior-wave JSON summaries to wave 3, that is still a form of context carryover — even though it is structured JSON, it grows with each wave and violates the freshness invariant (INV-TBD-b). The wave agent should receive only what it needs to execute its assigned specs.

## Notes
FR-4: wave agents are fresh per wave, no carryover context. BR-5: orchestrator MUST NOT pass spec file contents to wave agents. INV-TBD-b: wave agent freshness invariant.
