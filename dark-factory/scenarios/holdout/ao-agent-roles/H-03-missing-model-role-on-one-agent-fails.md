# Scenario: Missing model-role on exactly one agent fails the test

## Type
edge-case

## Priority
high — partial implementation (8 of 9 agents updated, one missed) must be caught, not silently pass

## Preconditions
- 8 of 9 `.claude/agents/*.md` files have `model-role` correctly set
- 1 agent file (e.g., `codemap-agent.md`) is missing the `model-role` field entirely
- The test describe block iterates over all 9 agents

## Action
Run the test suite against the partially-updated state.

## Expected Outcome
- The assertion for the 8 correctly updated agents passes
- The assertion for `codemap-agent` fails with a message like: "codemap-agent model-role field is missing"
- Test run exits with failure; no false "all passed" result
- The error message identifies the specific missing agent by name

## Failure Mode (if assertions are wrong)
If the test iterates in a loop but uses a single `assert.ok` outside the loop body, one failure might not surface all failures. Each agent must be checked independently with its name in the assertion message.

## Notes
BR-1 requires the field on all 9 agents. This scenario validates that the loop-based test assertions fire individually per agent, not as a batch that could mask partial failures. Corresponds to BR-1 in the spec.
