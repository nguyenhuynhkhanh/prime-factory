# Scenario: H-12 — Build completes within the performance threshold (< 50ms)

## Type
edge-case

## Priority
medium — a slow build blocks every `npm test` run; must not noticeably slow down the development loop

## Preconditions
- All 9 source files and 4 shared files exist
- Build is run from the project root on a standard development machine

## Action
Run `time node bin/build-agents.js` (or use `console.time` within the script). Measure wall-clock time from start to exit.

## Expected Outcome
- Wall-clock time is under 50ms for a clean build (no caching needed — pure file I/O)
- Given the project has 9 agents and 4 shared files, total reads are at most ~13 files; this is comfortably within 50ms for any SSD-based system

## Failure Mode (if applicable)
If the build unexpectedly reads a large number of files or performs expensive string operations (e.g., a full-file regex per include), performance could degrade. The script should process each source file linearly without backtracking.

## Notes
Exercises NFR-2. This is a soft performance test — not a hard CI gate but a sanity check. The primary risk is accidentally globbing or reading files beyond the 9 source agents and 4 shared files.
