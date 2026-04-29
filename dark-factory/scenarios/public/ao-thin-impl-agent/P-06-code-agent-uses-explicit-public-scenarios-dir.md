# Scenario: code-agent brief requires use of explicit publicScenariosDir, not a broad scenarios glob

## Type
feature

## Priority
critical — information barrier protection. A broad `dark-factory/scenarios/` glob would allow code-agent to discover holdout scenario filenames, leaking the holdout test structure.

## Preconditions
- `src/agents/code-agent.src.md` (or compiled `code-agent.md`) has been modified per this spec.

## Action
Read `.claude/agents/code-agent.md`. Look for instructions about how to load scenario files.

## Expected Outcome
- The agent text contains a rule or instruction specifying that scenario files must be loaded from `publicScenariosDir` (the path provided in the spawn brief), not from a broad `dark-factory/scenarios/` root path.
- The agent text does NOT contain instructions to glob `dark-factory/scenarios/` broadly.
- Optionally: the agent text contains a NEVER or MUST NOT rule explicitly prohibiting broad scenarios-root globbing.

## Failure Mode
If code-agent's text allows or instructs globbing from `dark-factory/scenarios/` root, a malformed brief (or a future AI edit that omits `publicScenariosDir`) could cause holdout scenario discovery.

## Notes
Validates FR-5, BR-2, EC-8, AC-5, INV-TBD-b. This scenario is also tested in holdout (H-02) with a more adversarial framing.
