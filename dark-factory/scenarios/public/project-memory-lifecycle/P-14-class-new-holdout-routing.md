# Scenario: new-holdout failure class routes to code-agent (existing behavior)

## Type
feature

## Priority
high — preserves existing feature-level failure loop.

## Preconditions
- test-agent.md and implementation-agent.md edited.
- A new holdout test fails in Step 2.75.

## Action
Read test-agent.md's Step 2.75 classification documentation and implementation-agent.md's routing for new-holdout.

## Expected Outcome
- test-agent classifies the failure as `class: new-holdout`.
- implementation-agent routes new-holdout failures to the standard code-agent re-run loop (existing behavior — sanitized behavioral description, up to 3 rounds).
- No new routing path added for this class; it matches existing Step 2 / 2.5 handling.

## Notes
Confirms the new classification does not break existing behavior for the baseline class.
