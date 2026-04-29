# Scenario: H-11 — `scripts/deploy.sh` dirty-tree check catches uncommitted build output

## Type
edge-case

## Priority
medium — the build step and the dirty-tree check interact; ensures the expected behavior is understood

## Preconditions
- `scripts/deploy.sh` has build as its first step
- A source file in `src/agents/` has been edited but the build has NOT been run
- Git working tree is "dirty" because `src/agents/shared/context-loading.md` has uncommitted changes

## Action
Run `scripts/deploy.sh patch` (or read the deploy.sh script to trace the execution path).

## Expected Outcome
- Step 1: `node bin/build-agents.js` runs and updates `.claude/agents/*.md` and `plugins/dark-factory/agents/*.md`
- Step 2 (pre-flight): `git status --porcelain` detects that the ASSEMBLED output files are now modified (because the build just updated them)
- The deploy script fails with "Working tree is dirty" before any version bump
- This is EXPECTED behavior — the developer must commit the built output before deploying

## Failure Mode (if applicable)
The expected failure is the deploy abort. Recovery: run `git add .claude/agents/ plugins/dark-factory/agents/ && git commit -m "chore: rebuild agents"` then re-run deploy.

## Notes
Exercises EC-10. This scenario documents the intentional interaction between the build step and the dirty-tree check. The deploy.sh design decision: building first ensures we never publish stale assembled output; the dirty-tree check then guards against committing in the same step without review.
