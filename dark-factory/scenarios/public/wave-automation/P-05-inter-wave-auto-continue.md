# Scenario: Inter-wave auto-continuation with progress reporting

## Type
feature

## Priority
critical -- the elimination of inter-wave pauses is a primary goal

## Preconditions
- SKILL.md has been updated with autonomous wave execution

## Action
Read the wave execution flow in the updated SKILL.md.

## Expected Outcome
- The SKILL.md contains explicit language stating that after a wave completes, the orchestrator automatically proceeds to the next wave
- There is NO language suggesting the orchestrator waits for developer acknowledgment between waves
- The SKILL.md describes a progress reporting format: "Wave N complete (spec-a: status, spec-b: status). Starting Wave N+1..."
- The only conditions that prevent auto-continuation are: all remaining specs are blocked, or a merge conflict occurred

## Failure Mode
N/A -- content assertion

## Notes
Validates FR-5, FR-6, and AC-4. The progress messages are non-blocking -- they inform the developer without requiring a response.
