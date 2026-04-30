# Scenario: P-04 — architect-agent has an explicit code investigation step before spec review

## Type
feature

## Priority
critical — without code investigation, the architect cannot produce a code reality report or write meaningful ADRs.

## Preconditions
- `.claude/agents/architect-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/architect-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/architect-agent.md` describes a code investigation step that occurs before spec review. Look for: "code reality report", "ARCH_INVESTIGATE", "investigate codebase", "read codebase before reviewing" — any phrase indicating that codebase reading precedes spec review.

## Expected Outcome
- Assertion passes: architect file contains the code investigation step.
- Same assertion passes on plugin mirror.

## Failure Mode (if applicable)
If investigation is described as optional or occurs after spec review, test fails.
