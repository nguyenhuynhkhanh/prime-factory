# Scenario: P-10 — Judge agents (architect-agent, test-agent) always use claude-sonnet

## Type
feature

## Priority
critical — FR-6, BR-5, INV-TBD-a. This is an invariant: judge agents must never use Opus regardless of mode. A test that verifies this at the structural level enforces the rule even as future modes are added.

## Preconditions
- `.claude/agents/implementation-agent.md` updated for this feature.
- `plugins/dark-factory/agents/implementation-agent.md` mirrored.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test asserts that `implementation-agent.md` explicitly states that architect-agent and test-agent always use `claude-sonnet`. Acceptable phrases include:
- "architect-agent ... always ... claude-sonnet"
- "judge agents ... claude-sonnet ... regardless of mode"
- "test-agent ... claude-sonnet"

## Expected Outcome
- Assertion passes: the always-sonnet rule for judge agents is documented.

## Failure Mode (if applicable)
"implementation-agent.md should document that judge agents (architect-agent, test-agent) always use claude-sonnet regardless of mode."

## Notes
BR-5 makes this absolute with "no override path." The structural test checks the documentation; holdout scenario H-04 verifies no exception path exists in the logic.
