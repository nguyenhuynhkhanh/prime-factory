# Scenario: Library/CLI project marks API and Auth sections as N/A

## Type
edge-case

## Priority
medium -- libraries and CLIs are common project types

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The profile template includes API Conventions and Auth Model sections

## Action
Read the onboard-agent file. Check for guidance on handling projects that don't have APIs or auth (e.g., libraries, CLI tools).

## Expected Outcome
- The onboard-agent has guidance (either in the template or in process instructions) for marking sections as N/A when they don't apply
- The API Conventions section should be marked "N/A -- this project is a {type}" rather than omitted entirely
- The Auth Model section should similarly be marked N/A for projects without authentication
- The guidance distinguishes between "not applicable to this project type" and "not yet established" (greenfield)

## Failure Mode (if applicable)
If sections are simply omitted, agents with section-targeted reading would not know whether the section doesn't exist because it wasn't generated or because the project doesn't need it.

## Notes
This is about the template/instructions, not about an actual profile output.
