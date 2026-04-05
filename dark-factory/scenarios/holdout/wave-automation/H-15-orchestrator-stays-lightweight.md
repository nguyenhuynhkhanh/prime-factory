# Scenario: High-level orchestrator remains lightweight (no spec/code/test content)

## Type
feature

## Priority
high -- the whole point of the architecture is context efficiency

## Preconditions
- SKILL.md has been updated

## Action
Read the high-level orchestrator description in the updated SKILL.md. Check what information it handles.

## Expected Outcome
- The orchestrator ONLY handles: manifest data, wave assignments (spec names per wave), wave agent results (per-spec status), progress messages, and the final summary
- The orchestrator does NOT read or process: spec file content, scenario files, code agent output, test results, architect review content
- The orchestrator does NOT spawn: architect agents, code agents, test agents, or promote agents directly (for multi-spec runs -- single-spec mode is different)
- The wave agent is explicitly described as the entity that reads specs, spawns sub-agents, and handles the lifecycle

## Failure Mode
N/A -- content assertion

## Notes
Validates NFR-1. If the orchestrator accumulates spec content or code output, it will hit context limits on large pipelines -- which is the exact problem this feature solves.
