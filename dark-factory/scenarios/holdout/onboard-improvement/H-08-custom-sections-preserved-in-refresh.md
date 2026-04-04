# Scenario: Custom sections in existing profile are preserved during refresh

## Type
edge-case

## Priority
medium -- protects developer customizations

## Preconditions
- The onboard-agent file exists at `.claude/agents/onboard-agent.md`
- The incremental refresh behavior is documented (FR-4)

## Action
Read the onboard-agent file. Verify the incremental refresh handles sections that exist in the old profile but are not in the new template.

## Expected Outcome
- The instructions mention that sections from the old profile not covered by the new analysis should be preserved (not deleted)
- This covers custom sections like "Developer Notes" which contain free-form developer-authored content
- The merge logic treats unknown/custom sections as "not changed by this refresh" rather than "should be removed"

## Failure Mode (if applicable)
If the refresh assumes the new analysis covers all sections, custom sections would be silently deleted -- the most destructive possible behavior for an incremental refresh.

## Notes
The current profile has a "Developer Notes" section. If a refresh only knows about the template's standard sections, it must preserve anything extra.
