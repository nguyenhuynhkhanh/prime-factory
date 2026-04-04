# Scenario: Enriched profile template includes all new sections

## Type
feature

## Priority
critical -- the enriched template is the foundation of the entire feature

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The file contains a "Project Profile Template" section with markdown template content

## Action
Read the onboard-agent file and verify the profile template includes all 5 new sections.

## Expected Outcome
- The template contains a section header for "API Conventions" with sub-items for URL patterns, versioning, response format, and error shape
- The template contains a section header for "Authentication & Authorization Model" with sub-items for auth mechanism, roles, and guard patterns
- The template contains a section header for "Environment & Configuration" with sub-items for how config is loaded and env var naming
- The template contains a section header for "Key Business Domain Entities" (or "Business Domain Entities") with a note that it is conditional
- The template contains a section header for "Common Gotchas" for project-specific pitfalls

## Notes
The Business Domain Entities section should have a note or instruction indicating it is conditionally included based on project relevance (see FR-7).
