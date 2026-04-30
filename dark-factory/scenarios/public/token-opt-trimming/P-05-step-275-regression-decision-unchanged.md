# Scenario: P-05 — Step 2.75 regression gate failure classification is unchanged by output filtering

## Type
feature

## Priority
high — The four failure classes in Step 2.75 (new-holdout, invariant-regression, pre-existing-regression, expected-regression) must not be disrupted by the filter. The filter changes context volume, not routing logic (BR-4).

## Preconditions
- `src/agents/test-agent.src.md` has been updated.
- The Step 2.75 section still documents all four failure classes.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/test-agent.md` still contains all four failure class descriptions:
1. `new-holdout`
2. `invariant-regression`
3. `pre-existing-regression`
4. `expected-regression`

And that the structured output fields `preExistingRegression` and `expectedRegression` are still documented.

## Expected Outcome
- All four class names present in the test-agent content.
- `preExistingRegression` and `expectedRegression` fields documented.
- The filter addition did not remove or replace any existing Step 2.75 logic.

## Failure Mode (if applicable)
If the edit accidentally removed the failure classification logic (e.g., replaced the section rather than amended it), the regression gate would lose its ability to distinguish failure types — a serious regression.

## Notes
These assertions overlap with existing `project-memory-lifecycle` promoted tests that verify Step 2.75 exists. The new token-opt-trimming assertions layer on top: they verify the filter was ADDED without the existing logic being REMOVED.
