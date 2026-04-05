# Scenario: Pre-flight test gate blocks implementation when tests fail

## Type
feature

## Priority
critical — this is the primary safety net; if it doesn't block, broken code ships

## Preconditions
- `dark-factory/project-profile.md` exists with `Testing > Run: node --test tests/dark-factory-setup.test.js`
- A spec exists at `dark-factory/specs/features/my-feature.spec.md`
- Public and holdout scenarios exist for `my-feature`
- The project's test suite has at least one failing test

## Action
Developer runs `/df-orchestrate my-feature`

## Expected Outcome
- df-orchestrate reads the project profile's test command
- df-orchestrate runs `node --test tests/dark-factory-setup.test.js`
- Tests fail
- df-orchestrate reports ALL failures (not just the first)
- df-orchestrate STOPS — does NOT proceed to architect review
- No architect-agent is spawned
- No code-agent is spawned
- Manifest entry is NOT updated with any implementation status

## Notes
The gate runs BEFORE architect review (BR-1), not after. This is verified by checking that architect-agent.md is never referenced in the execution flow when tests fail.
