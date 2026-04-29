# Scenario: H-03 — Missing shared file causes build to fail loudly with a descriptive error

## Type
failure-recovery

## Priority
critical — prevents silent production of agents with missing blocks

## Preconditions
- `src/agents/spec-agent.src.md` contains `<!-- include: shared/context-loading.md -->`
- `src/agents/shared/context-loading.md` has been deleted or renamed

## Action
Run `node bin/build-agents.js`.

## Expected Outcome
- Exit code 1 (non-zero)
- Error message printed to stderr naming the missing file: something like `Error: include file not found: src/agents/shared/context-loading.md (referenced in src/agents/spec-agent.src.md)`
- No assembled output file for `spec-agent` is written to `.claude/agents/` (or if a partial write occurs, the test must verify the file is either absent or flagged as incomplete)
- The `pretest` hook failing with this error causes `npm test` to abort before running the test suite

## Failure Mode (if applicable)
The build script itself failing is the expected behavior here.

## Notes
Exercises FR-6, BR-3, and EC-7. The key requirement is the actionable error message — "include file not found" with both the missing path and the referring source file. A generic "build failed" message is not acceptable.
