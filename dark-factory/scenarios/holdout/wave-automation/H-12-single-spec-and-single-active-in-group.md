# Scenario: Single spec invocation and single-active-spec group both skip wave agents

## Type
edge-case

## Priority
high -- ensures the wave architecture does not add overhead for simple cases

## Preconditions
- SKILL.md has been updated

## Action
Read the updated SKILL.md for how single-spec cases are handled.

## Expected Outcome
- Explicit single-spec invocation (`/df-orchestrate my-feature`): runs directly inline, no wave agent spawning, current behavior preserved
- Group mode with only one active spec (`/df-orchestrate --group X` where group X has one remaining active spec): behaves like single-spec mode (no wave agent overhead)
- In both cases, the full lifecycle runs inline: pre-flight, architect review, implementation, holdout, promote, cleanup
- The smart re-run default-to-"new" and parallelism auto-proceed changes STILL apply in single-spec mode (these are independent of wave architecture)

## Failure Mode
N/A -- content assertion

## Notes
Validates EC-1, EC-4, and BR-6. The wave agent architecture is an optimization for multi-spec runs. It should not add complexity to the common single-spec case.
