# Scenario: References dedup — repeated promotion of same spec does not duplicate referencedBy

## Type
idempotency

## Priority
medium — robustness against re-promotion (e.g., after manifest cleanup failure).

## Preconditions
- INV-0003.referencedBy = [spec-a].
- spec-a's spec is re-promoted (e.g., after a manual rollback / re-run).
- spec-a's spec declares `## Invariants > References > INV-0003`.

## Action
promote-agent processes spec-a again.

## Expected Outcome
- INV-0003.referencedBy remains [spec-a] (NOT [spec-a, spec-a]).
- Dedup is by spec name (string equality).
- Idempotent.

## Notes
Adversarial — naive impl might append unconditionally. Test sets up an existing entry with the spec already in referencedBy and asserts no duplicate.
