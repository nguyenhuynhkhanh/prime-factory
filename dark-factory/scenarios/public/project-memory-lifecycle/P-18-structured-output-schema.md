# Scenario: test-agent Step 2.75 structured output contains both regression booleans

## Type
feature

## Priority
high — machine-readable output enables orchestrator routing.

## Preconditions
- test-agent.md edited.

## Action
Read test-agent.md's Step 2.75 output-schema documentation.

## Expected Outcome
- Structured output documented as an object recorded in `dark-factory/results/{feature}/run-{timestamp}.md` metadata.
- Fields documented: `status`, `newHoldoutResult`, `regressionResult: { class, failingTests: [{ path, class, guardAnnotation, behavioralDescription }] }`, `preExistingRegression: boolean`, `expectedRegression: boolean`.
- Both booleans are always present (defaulted to `false`).
- Multiple failing tests with different classes are all recorded in `failingTests` array.

## Notes
Covers FR-15. Tests assert the field names appear verbatim in the documentation.
