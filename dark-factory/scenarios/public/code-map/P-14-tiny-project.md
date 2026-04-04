# Scenario: Tiny project (<5 files) produces minimal map or defers to Architecture section

## Type
edge-case

## Priority
medium -- tiny projects exist but are less common in practice

## Preconditions
- Project has 3 source files in a single directory
- Files have simple import relationships (A imports B, B imports C)

## Action
Run Phase 3.5 of onboard-agent.

## Expected Outcome
- Phase 3.5 detects <5 source files
- Either:
  - Produces a minimal code map (all 7 sections, most nearly empty), OR
  - Writes "Project is small -- Architecture section covers all relationships"
- If a map is produced, it is well under 40 lines
- 1 scanner agent spawned (small project path)

## Notes
Validates EC-2 and EH-2. The implementation has discretion on minimal map vs. deferral, but one of these two outcomes must occur.
