# Scenario: Existing project-profile.md content not corrupted by code map reference addition

## Type
edge-case

## Priority
critical -- profile is the most shared resource in the pipeline; corruption would break all agents

## Preconditions
- Existing project-profile.md with full content (all template sections populated)
- Profile has been manually customized by developer (e.g., custom "Developer Notes" section)
- Code map generation completes successfully

## Action
Onboard-agent adds the code-map.md reference link to the profile.

## Expected Outcome
- All existing profile sections preserved verbatim
- Custom "Developer Notes" section preserved
- Reference link added in the header area (after "How This Profile Is Used")
- Agent consumption table updated with code-map.md mention
- No existing table rows modified or removed
- No content reflow or reformatting of existing sections
- Profile remains valid markdown

## Notes
Cross-feature scenario: validates that the code map feature's modification of project-profile.md does not break the onboard-agent's existing incremental refresh logic or any agent's profile reading.
