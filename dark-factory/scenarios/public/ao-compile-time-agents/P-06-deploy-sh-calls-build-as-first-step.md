# Scenario: P-06 — `scripts/deploy.sh` calls build as its first step

## Type
feature

## Priority
high — ensures releases always publish assembled (not stale) agent output

## Preconditions
- `scripts/deploy.sh` has been updated with `node bin/build-agents.js` as its first step (before pre-flight checks)

## Action
Read `scripts/deploy.sh`. Check for the build call and its position relative to pre-flight checks.

## Expected Outcome
- `scripts/deploy.sh` contains `node bin/build-agents.js`
- The build call appears BEFORE the `npm whoami` pre-flight check
- If the build step fails, the deploy exits before any version bump, commit, or publish occurs

## Failure Mode (if applicable)
If the build is placed AFTER the version bump, the version could be bumped even if the build fails. The build must be the first step.

## Notes
Exercises FR-8. This is a static text assertion (verify ordering in the file content). Regression: any future reordering of deploy.sh steps must keep the build as step 1.
