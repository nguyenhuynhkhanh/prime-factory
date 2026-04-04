# Scenario: --group combined with explicit spec names produces clear error

## Type
edge-case

## Priority
medium -- validates argument parsing

## Preconditions
- Any manifest state

## Action
Developer invokes: `/df-orchestrate --group auth spec-a spec-b`

## Expected Outcome
- Error: "Cannot combine --group/--all with explicit spec names. Use one mode at a time."
- No execution, no manifest changes

## Notes
This validates FR-8 and AC-15.
