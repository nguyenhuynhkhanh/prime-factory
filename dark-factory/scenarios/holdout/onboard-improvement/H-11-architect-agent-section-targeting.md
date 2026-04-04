# Scenario: architect-agent has correct section-targeted profile reading

## Type
feature

## Priority
high -- verifies the specific section list for architect-agent

## Preconditions
- The architect-agent file exists at `.claude/agents/architect-agent.md`

## Action
Read the architect-agent file and verify its section-targeted profile reading instructions.

## Expected Outcome
- The architect-agent's profile reading instruction (currently lines 55-60) lists specific sections: Overview, Tech Stack, Architecture, Structural Notes, API Conventions, Auth Model, Common Gotchas
- The instruction is more specific than the current "primary context for: Architecture and patterns, Quality bar expectations, Known structural issues, Tech stack constraints"
- The instruction still includes the fallback recommendation to run /df-onboard if no profile exists

## Notes
The architect-agent has a relatively detailed profile reference already, but it doesn't mention the new sections (API Conventions, Auth Model, Common Gotchas) and should list specific section names rather than paraphrased descriptions.
