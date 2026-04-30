# Scenario: H-07 — decision node supersession protocol prohibits deletion of old nodes

## Type
edge-case

## Priority
high — deleted decisions cannot be audited. If a superseded decision was wrong in a way that caused an incident, the history must be recoverable.

## Preconditions
- `dark-factory/memory/intent-foundation.md` describes the supersession protocol.
- `.claude/agents/architect-agent.md` describes the supersession process.

## Action
Structural test verifies in both files:
1. Supersession protocol explicitly states: old node must NOT be deleted — only updated to status: superseded.
2. The Superseded-by field is described as required when status is superseded.
3. The protocol describes that agents query status: active only — they do not see superseded nodes in their working context.

## Expected Outcome
- Deletion prohibition is explicit in at least one of the two files.
- Superseded-by field requirement is documented.
- Active-only query protocol is documented.

## Failure Mode (if applicable)
If the protocol says "update or delete the old decision" — even as an alternative — test fails. No-deletion must be unambiguous.
