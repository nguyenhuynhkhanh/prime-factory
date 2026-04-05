# Scenario: Code-agent in feature mode runs ALL existing tests

## Type
feature

## Priority
critical — closes the asymmetry between feature and bugfix mode

## Preconditions
- code-agent is spawned in feature mode
- The project has existing tests that are not related to the new feature

## Action
Code-agent completes implementation (Step 6 in Feature Mode)

## Expected Outcome
- code-agent runs ALL existing tests, not just the tests it wrote
- If any existing test fails, code-agent reports the regression
- The instruction in code-agent.md says "Run ALL existing tests to verify no regression" (matching bugfix mode wording)

## Notes
FR-7: This is a text change in code-agent.md. The behavioral intent is that the code-agent runs the project's full test suite, same as bugfix mode Step 2 already requires.
