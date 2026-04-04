# Scenario: Profile preamble maps sections to consuming agents

## Type
feature

## Priority
high -- the preamble helps developers and agents understand profile structure

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`

## Action
Read the onboard-agent file and verify the profile template begins with a "How This Profile Is Used" preamble.

## Expected Outcome
- The template includes a section titled "How This Profile Is Used" (or similar preamble)
- The preamble maps profile sections to the agents that consume them
- At minimum, it references: spec-agent, architect-agent, code-agent, test-agent, debug-agent, and promote-agent
- Each agent listing includes which sections that agent reads

## Notes
This preamble serves dual purpose: it helps developers understand what to review carefully, and it provides a quick reference for agents.
