# Scenario: Single-spec invocation preserves current behavior

## Type
feature

## Priority
critical -- backward compatibility; single-spec is the most common invocation

## Preconditions
- SKILL.md has been updated

## Action
Read the updated SKILL.md. Verify single-spec behavior.

## Expected Outcome
- The SKILL.md explicitly states that single-spec invocation (`/df-orchestrate my-feature`) runs directly without wave agent spawning
- The single-spec path still includes: pre-flight checks, architect review, implementation cycle, holdout validation, promotion, cleanup -- all inline (not delegated to a wave agent)
- The smart re-run default-to-"new" change DOES apply to single-spec mode (no interactive prompt regardless)
- The parallelism auto-proceed change DOES apply to single-spec mode

## Failure Mode
N/A -- content assertion

## Notes
Validates BR-6, EC-1, and AC-6. The wave agent architecture is ONLY for multi-spec runs.
