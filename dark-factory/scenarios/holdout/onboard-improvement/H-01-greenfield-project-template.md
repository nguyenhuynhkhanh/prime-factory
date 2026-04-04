# Scenario: Greenfield project produces minimal profile with new section placeholders

## Type
edge-case

## Priority
high -- greenfield is a common first-use case for onboarding

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The profile template includes the 5 new sections

## Action
Read the onboard-agent file. Verify how it handles greenfield projects (no source code, only scaffolding) with respect to the new sections.

## Expected Outcome
- The onboard-agent instructions address greenfield projects explicitly
- For greenfield projects, the new sections (API Conventions, Auth Model, Environment & Config, Business Domain Entities, Common Gotchas) should either be marked "Not yet established" or have guidance indicating they are populated as the project grows
- The template should NOT omit the new sections entirely for greenfield projects -- having placeholder sections preserves the template structure for future `df-onboard` refreshes
- Code examples should NOT be included by default for greenfield projects (BR-5)

## Failure Mode (if applicable)
If the onboard-agent omits new sections for greenfield projects, future incremental refreshes would treat them as "new sections" rather than "updated sections," confusing the diff.

## Notes
The current greenfield handling (line 25-26) says "produce a minimal profile noting 'greenfield project' and ask the developer about their intended stack." The new behavior should extend this to include placeholder sections.
