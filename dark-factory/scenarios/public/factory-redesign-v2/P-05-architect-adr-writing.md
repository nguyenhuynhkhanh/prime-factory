# Scenario: P-05 — architect-agent instructions require writing Layer 2 ADRs before approving a spec

## Type
feature

## Priority
critical — ADRs are the traceability mechanism. An approval without ADRs breaks the intent drift prevention chain.

## Preconditions
- `.claude/agents/architect-agent.md` has been updated for this feature.
- `plugins/dark-factory/agents/architect-agent.md` has been mirrored.
- `tests/dark-factory-setup.test.js` contains the factory-redesign-v2 assertion block.

## Action
Run the structural test suite:
```
node --test tests/dark-factory-setup.test.js
```
The test must verify that `.claude/agents/architect-agent.md` contains instructions to write ADRs. Look for: "write ADR", "Layer 2 ADR", "decision node", "must write at least one ADR before approving" — any phrase linking approval to ADR production.

Also verify the ADR schema fields are described: status, domain, layer, statement, rationale, impact, effective date.

## Expected Outcome
- Assertion passes: file contains ADR-writing requirement before approval.
- Assertion passes: file contains ADR schema (all 7 required fields).
- Same assertions pass on plugin mirror.

## Failure Mode (if applicable)
If ADR writing is described as optional or as a separate step decoupled from approval, test fails. The constraint is: no APPROVED without ADRs.
