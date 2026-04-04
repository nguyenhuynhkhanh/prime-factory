# Scenario: project-profile.md updated with reference link to code-map.md

## Type
feature

## Priority
high -- without the reference, agents won't know the code map exists

## Preconditions
- project-profile.md exists with standard template sections
- Code map generation has completed successfully

## Action
Onboard-agent Phase 3.5 completes and writes the code map.

## Expected Outcome
- project-profile.md contains a reference line linking to code-map.md (e.g., "See also: [Code Map](code-map.md)")
- The reference is in the header area, not buried in a section
- Existing profile content is NOT modified -- only the reference line is added
- The agent consumption table in the profile is updated to mention code-map.md

## Notes
Validates FR-6 and BR-3. The profile must stay lean -- only a reference, not the code map content.
