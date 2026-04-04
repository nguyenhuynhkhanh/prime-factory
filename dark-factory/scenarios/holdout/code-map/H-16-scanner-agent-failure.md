# Scenario: Scanner agent fails mid-scan; synthesizer works with available reports

## Type
failure-recovery

## Priority
high -- agent failures are realistic in production; must degrade gracefully

## Preconditions
- Large project with 5 scanners spawned
- Scanner 3 fails (timeout, crash, or produces no output)
- Scanners 1, 2, 4, 5 complete successfully

## Action
Synthesizer attempts to merge reports from all scanners.

## Expected Outcome
- Synthesizer proceeds with reports from scanners 1, 2, 4, 5
- Code map is generated with a warning in the header: "Incomplete coverage -- scanner for {directories} did not complete"
- Dependency graph contains modules from the 4 successful scanners
- Modules from scanner 3's chunk are absent from the graph (not fabricated)
- Hotspot scores may be slightly inaccurate (missing imports from scanner 3's chunk) -- this is acceptable
- Developer is informed about incomplete coverage during sign-off
- Code map generation is NOT blocked by the failure

## Notes
Validates EC-10 and EH-4. Partial results are better than no results.
