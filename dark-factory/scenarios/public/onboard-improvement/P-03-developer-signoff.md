# Scenario: Developer sign-off step before writing profile

## Type
feature

## Priority
critical -- prevents bad profile data from propagating to all agents

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`

## Action
Read the onboard-agent file and verify it includes a developer sign-off step.

## Expected Outcome
- The onboard-agent process includes a step where it presents the generated profile to the developer
- The step explicitly asks for confirmation (e.g., "Does this look right?")
- The step occurs AFTER profile generation and BEFORE writing to disk
- If the developer rejects, the agent must revise and re-present
- The constraint is clear: the profile must NOT be written to disk until the developer confirms

## Notes
The sign-off step should be in the process flow (Phase 7 or similar), not just a suggestion in the constraints.
