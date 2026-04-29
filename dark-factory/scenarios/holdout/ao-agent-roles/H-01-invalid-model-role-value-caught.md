# Scenario: Invalid model-role value is caught by the test assertions

## Type
edge-case

## Priority
high — if the test assertions only check for field presence but not value validity, a typo like "Generator" or "prod" would silently pass and corrupt ao-pipeline-mode's routing logic

## Preconditions
- `tests/dark-factory-setup.test.js` has been updated with the new ao-agent-roles describe block
- The test file contains a value-validity assertion (not just a presence assertion)

## Action
Temporarily mutate one agent file during test verification (or write a dedicated test case that checks the assertion logic itself) to have an invalid `model-role` value:

```
model-role: Generator
```
(capitalized — common typo)

Then run the test suite.

## Expected Outcome
- The test assertion `validRoles.includes(fm['model-role'])` evaluates to `false` for `"Generator"`
- The test fails with a message that includes the agent name and the invalid value
- No agent with a non-lowercase, non-exact value can silently pass

## Failure Mode (if assertions are insufficient)
If the code-agent only checks `assert.ok(fm['model-role'])`, a value of `"Generator"` is truthy and the test passes silently. This scenario catches that gap.

## Notes
This scenario is a holdout because it tests the robustness of the test assertions themselves, not just the agent file content. The code-agent should not see this scenario and optimize for it — the test assertion quality is what is being validated here.
