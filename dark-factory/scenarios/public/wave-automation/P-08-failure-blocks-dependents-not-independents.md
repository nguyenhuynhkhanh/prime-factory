# Scenario: Spec failure blocks dependents but not independent specs

## Type
feature

## Priority
critical -- failure isolation is essential for pipeline efficiency

## Preconditions
- SKILL.md has been updated with autonomous failure handling

## Action
Read the failure handling sections of the updated SKILL.md.

## Expected Outcome
- When a spec fails (after 3 rounds or architect blocks): the spec is marked as failed, ALL transitive dependents are marked as blocked, and independent specs in the same or subsequent waves continue executing
- The SKILL.md does NOT contain "Ask the developer to decide next steps" or any language that pauses for developer input on failure
- Instead, failures are accumulated and reported in the final summary
- The failure handling explicitly states that independent specs are NOT affected by another spec's failure

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-8, BR-2, and AC-3.
