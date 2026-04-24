# Scenario: Memory entry with status `modified` is not checked for violations

## Type
edge-case

## Priority
medium — validates the status-gate on violation checks

## Preconditions
- Memory contains `INV-0090` with `status: modified` (was modified by an earlier spec; some detail was narrowed)
- Memory contains `INV-0091` with `status: active` (the canonical post-modification rule for the same subject area)
- A new spec's scope overlaps with both entries' `scope.modules`
- The spec does something that WOULD have violated `INV-0090`'s original rule, but does NOT violate `INV-0091`

## Action
The owning-domain architect-agent runs the probe.

## Expected Outcome
- Architect skips `INV-0090` for violation checks (its `status` is not `active`; it is no longer the canonical rule).
- Architect checks `INV-0091` for violations → no violation found.
- Architect MAY list `INV-0090` under `Preserved` if the spec explicitly references it (as historical context) — but does NOT BLOCK.
- Review Status: APPROVED or APPROVED WITH NOTES (no violation BLOCKER).

## Failure Mode
If architect treated `status: modified` the same as `status: active`, every spec that made a clean forward-step past a prior modification would be incorrectly blocked. The `status` gate is mandatory.

## Notes
Validates EC-14, BR-8 (no cascade) indirectly, and the status field's use in the probe. The probe MUST filter on `status: active` before checking for violations.
