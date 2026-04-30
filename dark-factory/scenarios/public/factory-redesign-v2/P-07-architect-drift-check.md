# Scenario: P-07 — architect-agent has a post-implementation drift check step

## Type
feature

## Priority
critical — without a post-implementation drift check, ADRs are written but never enforced against the actual code.

## Preconditions
- `.claude/agents/architect-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/architect-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/architect-agent.md` describes a drift check step after implementation. Look for: "drift check", "ARCH_DRIFT_CHECK", "review implementation against ADRs", "diff vs ADRs", "post-implementation review".

Also verify that the drift check output is described as referencing specific ADR IDs.

## Expected Outcome
- Assertion passes: architect file contains drift check description.
- Assertion passes: drift report output references ADR IDs.
- Same assertions pass on plugin mirror.

## Failure Mode (if applicable)
A general "review the implementation" instruction without tying it to ADR IDs fails. The check is specifically ADR-referenced, not open-ended.
