# Scenario: Advisor mode MUST NOT write files or execute tests

## Type
information-barrier

## Priority
critical — advisor is a read-only analyst.

## Preconditions
- test-agent.md edited.

## Action
Read test-agent.md's advisor-mode section.

## Expected Outcome
- The Constraints / Prohibitions section for advisor mode explicitly names:
  - NEVER write test files.
  - NEVER execute any test (no `npx playwright test`, no `node --test`).
  - NEVER modify scenarios in `dark-factory/scenarios/`.
  - NEVER modify the spec file.
  - NEVER re-investigate the feature.
- The `Read` and `Grep` tools may be used; `Bash` for test execution is forbidden in advisor mode; `Write` is forbidden in advisor mode.

## Notes
Adversarial — a naive advisor impl might run a test to check feasibility. Test asserts the prohibition list is complete.
