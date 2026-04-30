# Scenario: P-06 — architect-agent receives coverage map only during scenario review, not scenario content

## Type
feature

## Priority
critical — architect reading full scenarios bleeds QA domain into architect domain and inflates context cost.

## Preconditions
- `.claude/agents/architect-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/architect-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/architect-agent.md` explicitly states that scenario review is limited to the coverage map. Look for: "coverage map only", "not scenario content", "does not read scenario internals", "reviews coverage map not scenarios".

## Expected Outcome
- Assertion passes: architect file explicitly restricts scenario review to coverage map.
- Same assertion passes on plugin mirror.

## Failure Mode (if applicable)
If the file says "review scenarios" without the coverage-map-only qualifier, test fails. The restriction must be unambiguous.
