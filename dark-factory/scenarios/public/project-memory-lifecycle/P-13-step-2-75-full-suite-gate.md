# Scenario: test-agent Step 2.75 runs the full promoted test suite + new holdout

## Type
feature

## Priority
critical — the regression gate.

## Preconditions
- test-agent.md edited per this spec.
- `dark-factory/project-profile.md` has a `Run:` command.

## Action
Read test-agent.md's Step 2.75 section.

## Expected Outcome
- Step 2.75 is present, named "Full-suite regression gate" (or equivalent).
- Step is positioned AFTER existing Step 2.5 (per-scenario holdout validation) and BEFORE the output step.
- Step executes the project's full test command (from profile `Run:`) in ONE combined pass covering promoted tests + new holdout.
- Step runs only in `validator` mode.
- Step runs on every feature cycle (no opt-out in v1).

## Notes
Asserts the section exists with the correct phrase and position.
