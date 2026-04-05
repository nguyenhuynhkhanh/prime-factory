# Scenario: Wave agent receives correct context (spec names, branch, mode)

## Type
feature

## Priority
critical -- if the wave agent receives wrong context, the entire wave fails silently

## Preconditions
- SKILL.md has been updated with wave agent spawning description

## Action
Read the wave agent spawning section of SKILL.md. Verify the information passed to each wave agent.

## Expected Outcome
- The wave agent receives: the list of spec names assigned to that wave, the current branch reference (main with prior waves merged), and the mode (feature/bugfix)
- The wave agent does NOT receive: spec file content, scenario content, or results from prior waves (it reads these itself from the codebase -- fresh context)
- The orchestrator waits for the wave agent to return a structured result before proceeding
- The result structure includes per-spec status (passed/failed/blocked), error details for failures, and promoted test paths for successes

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-2 and NFR-1. The wave agent must start fresh -- the orchestrator should not pre-load spec content into the wave agent's prompt.
