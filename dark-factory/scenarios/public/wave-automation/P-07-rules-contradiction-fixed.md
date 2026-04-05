# Scenario: dark-factory.md rules contradiction fixed

## Type
feature

## Priority
high -- documentation accuracy prevents developer confusion

## Preconditions
- `dark-factory.md` has been updated

## Action
Read the updated `.claude/rules/dark-factory.md`. Check the Rules section.

## Expected Outcome
- The rules section does NOT contain the phrase "FULLY DECOUPLED -- never auto-triggered" (or the em-dash variant "FULLY DECOUPLED --- never auto-triggered")
- The rules section contains updated language acknowledging that df-intake can auto-invoke `/df-orchestrate` after developer confirmation
- The updated language still makes clear that implementation requires developer confirmation (not that it happens silently)
- The rest of the Rules section (information barriers, agent independence, architect review requirements) is unchanged

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-7, BR-7, and AC-9.
