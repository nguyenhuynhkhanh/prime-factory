# Scenario: Business domain section is conditional

## Type
feature

## Priority
medium -- prevents boilerplate in simple projects

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`

## Action
Read the onboard-agent file and verify the Business Domain Entities section is conditionally included.

## Expected Outcome
- The onboard-agent includes an instruction that the Business Domain Entities section should only be included when the project has domain-specific constraints affecting implementation
- Examples of when to include it are given (e.g., multi-tenant, compliance requirements)
- The onboard-agent is told to decide based on what it finds in the codebase
- There is guidance for what to do when the section is not needed (omit or mark N/A)

## Notes
This is about the instruction to the onboard-agent, not about the template itself. The template should have the section, but the instruction should say when to include/exclude it.
