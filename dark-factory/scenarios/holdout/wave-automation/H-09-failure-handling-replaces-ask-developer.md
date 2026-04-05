# Scenario: "Ask developer" replaced with autonomous reporting in failure handling

## Type
feature

## Priority
high -- the old "ask developer" language is the primary blocking behavior to remove

## Preconditions
- SKILL.md has been updated

## Action
Read the "Failure Handling Within Groups" section of the updated SKILL.md.

## Expected Outcome
- The phrase "Ask the developer to decide next steps. Do NOT auto-retry." is REMOVED
- Replaced with language stating: failures are accumulated and reported in the final summary with actionable next steps
- The section still states "Do NOT auto-retry" (failed specs are not automatically retried -- just reported)
- The section still marks failed specs and blocks transitive dependents
- The section still states independent specs continue executing
- The reporting format example still shows Completed/Failed/Blocked categories

## Failure Mode
N/A -- content assertion

## Notes
Validates EC-7. The current text at line 119 says "Ask the developer to decide next steps. Do NOT auto-retry." The first sentence must be removed/replaced; the second can stay (in spirit -- no auto-retry of failed specs).
