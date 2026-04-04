# Scenario: --group with empty string produces clear error

## Type
edge-case

## Priority
medium -- validates EC-11

## Preconditions
- Any manifest state

## Action
Developer invokes: `/df-orchestrate --group ""`
(or equivalently, --group with no argument following it)

## Expected Outcome
- Error: "--group requires a group name. Usage: /df-orchestrate --group <name>"
- No execution

## Failure Mode
If empty string is not caught, it might match specs with group: null or cause undefined behavior.

## Notes
This validates EC-11 and FR-8.
