# Scenario: invariant-regression class routes to code-agent with sanitized description

## Type
feature

## Priority
critical — the new regression-catching path.

## Preconditions
- test-agent.md and implementation-agent.md edited.
- A promoted test fails whose `Guards:` annotation references at least one file this spec's implementation touched.

## Action
Read test-agent.md's Step 2.75 classification for invariant-regression and implementation-agent.md's routing.

## Expected Outcome
- test-agent classifies as `class: invariant-regression`.
- test-agent's behavioral description comes from the promoted test's annotation header (in the test file itself) and `promoted-tests.json` — NOT from any holdout scenario.
- implementation-agent routes to the code-agent loop (same mechanism as new-holdout), passing the sanitized behavioral description.
- Rounds counter advances (subject to 3-round max).
- The behavioral description is information-barrier-safe: no holdout content, only the promoted test's public annotation.

## Notes
The promoted test's annotation is public (it lives in the project's test suite, not in holdout/). This is the key insight — we have a public source of behavioral descriptions to feed back to code-agent without breaking the holdout barrier.
