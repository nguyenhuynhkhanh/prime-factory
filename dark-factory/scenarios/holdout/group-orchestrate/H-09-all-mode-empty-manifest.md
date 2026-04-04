# Scenario: --all with no active specs reports nothing to do

## Type
edge-case

## Priority
medium -- validates EC-7

## Preconditions
- Manifest has `features: {}` (empty) or all entries have status != "active"

## Action
Developer invokes: `/df-orchestrate --all`

## Expected Outcome
- Info: "No active specs found. Nothing to do."
- No execution, no worktrees created, no errors

## Failure Mode
If the orchestrator doesn't check for empty results, it might proceed with an empty plan or throw an unexpected error.

## Notes
This validates EC-7. Empty state should be handled gracefully.
