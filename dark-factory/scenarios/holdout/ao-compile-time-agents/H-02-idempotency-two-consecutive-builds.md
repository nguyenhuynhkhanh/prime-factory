# Scenario: H-02 — Idempotency: running build twice produces identical output

## Type
edge-case

## Priority
high — required by BR-3 and NFR-1; ensures deploy.sh and CI builds are stable

## Preconditions
- All source files are in a stable state (no edits in progress)
- First build has already run (output files exist)

## Action
1. Record the content of all 9 files in `.claude/agents/` (checksums or full content).
2. Run `node bin/build-agents.js` again (second run).
3. Read all 9 files in `.claude/agents/` again.

## Expected Outcome
- The content of every file after the second build is byte-for-byte identical to after the first build
- No file modification timestamps change if the content is unchanged (the script should skip writing if content is identical — or writing is acceptable as long as content matches)
- Exit code 0 on both runs

## Failure Mode (if applicable)
N/A.

## Notes
Exercises FR-14. A build that adds timestamps, re-numbers things, or otherwise produces non-deterministic output would fail here. Key risk: the build script must not include build timestamps or run counters in the output.
