# Scenario: P-09 — qa-agent instructions include a self-review pass for scenario completeness

## Type
feature

## Priority
high — without self-review, shallow happy-path scenarios ship unchallenged. The architect cannot catch QA gaps (only ADR coverage gaps).

## Preconditions
- `.claude/agents/qa-agent.md` has been created for this feature.
- `plugins/dark-factory/agents/qa-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/qa-agent.md` describes a self-review pass. The pass must cover at minimum: edge cases, negative paths, boundary conditions, security surface. Look for all four phrases (or their equivalents) in the self-review section.

## Expected Outcome
- Assertion passes: self-review is described with all four coverage areas.
- Same assertion passes on plugin mirror.

## Failure Mode (if applicable)
If only 1-2 coverage areas are mentioned (e.g., edge cases only), test fails. The four areas are the minimum for a meaningful self-review.
