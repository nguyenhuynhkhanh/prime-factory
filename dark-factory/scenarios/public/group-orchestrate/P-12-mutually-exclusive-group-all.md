# Scenario: --group and --all used together produces clear error

## Type
edge-case

## Priority
high -- validates argument parsing

## Preconditions
- Any manifest state

## Action
Developer invokes: `/df-orchestrate --group auth --all`

## Expected Outcome
- Error: "Cannot use --group and --all together. Use --group to orchestrate a specific group, or --all to run everything."
- No execution, no manifest changes

## Notes
This validates FR-8 and AC-14.
