# Scenario: H-04 — Circular include detected and reported with the full chain

## Type
failure-recovery

## Priority
high — prevents infinite loops and cryptic failures during build

## Preconditions
- `src/agents/shared/block-a.md` contains `<!-- include: shared/block-b.md -->`
- `src/agents/shared/block-b.md` contains `<!-- include: shared/block-a.md -->`
- `src/agents/test-agent.src.md` contains `<!-- include: shared/block-a.md -->`
- (These are synthetic test files created for this scenario only — real shared files must not have circular includes)

## Action
Run `node bin/build-agents.js`.

## Expected Outcome
- Exit code 1
- Error message names the circular chain: something like `Error: circular include detected: block-a.md -> block-b.md -> block-a.md`
- The chain shows all hops, not just the first and last
- Build does not hang or produce a stack overflow
- `npm test` aborts due to `pretest` failure

## Failure Mode (if applicable)
If the build script recurses without a cycle check, it will exhaust the call stack and crash with a generic Node.js error. This scenario ensures the cycle detection runs first.

## Notes
Exercises FR-4, EC-9 (nested includes — the circular case is a special form of nesting), and BR-3. The visited-stack must be checked before each recursive resolution call.
