# Scenario: Explicit no-secrets constraint in onboard-agent

## Type
feature

## Priority
critical -- security rule preventing secret leakage

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`

## Action
Read the onboard-agent file and verify it contains an explicit no-secrets constraint.

## Expected Outcome
- The constraints section includes a rule about never including actual secret values
- The constraint uses the word "NEVER" (must be emphatic, not a suggestion)
- The constraint covers: API keys, passwords, connection strings, secret values
- The constraint specifies that env var NAMES should be referenced instead of values
- The constraint is in the main Constraints section at the bottom of the agent definition (not buried in a template comment)

## Notes
The existing constraints section has 5 bullet points (lines 211-216). The no-secrets rule should be added as a new bullet point in this section.
