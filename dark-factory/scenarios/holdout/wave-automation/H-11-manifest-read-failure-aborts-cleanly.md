# Scenario: Manifest read failure aborts before any execution

## Type
edge-case

## Priority
medium -- defensive error handling for a critical dependency

## Preconditions
- SKILL.md has been updated

## Action
Read the pre-flight checks and wave resolution sections of the updated SKILL.md.

## Expected Outcome
- The manifest is read during pre-flight checks / wave resolution (before any agents are spawned)
- If the manifest cannot be read (missing file, invalid JSON), the orchestrator aborts with a clear error message
- No wave agents, architect agents, or code agents are spawned if the manifest read fails
- This behavior exists in the current SKILL.md (pre-flight checks) and must be preserved in the updated version

## Failure Mode
N/A -- content assertion

## Notes
Validates the "Manifest read fails" error handling row. This is existing behavior that must not regress.
