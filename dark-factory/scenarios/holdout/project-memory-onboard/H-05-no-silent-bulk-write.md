# Scenario: H-05 — No silent bulk write path exists (adversarial)

## Type
concurrency

## Priority
critical — INV-TBD-a, BR-6, NFR-4. The most important security-style invariant in this feature.

## Preconditions
- Phase 3.7 and Phase 7 Memory Sign-Off are present.

## Action
Structural test performs an adversarial scan of the entire onboard-agent file for any phrase that could be interpreted as permitting a silent/automatic write to `dark-factory/memory/*`:
1. Assert the file does NOT contain phrases like `automatically write`, `write without asking`, `silent write`, `skip sign-off`, `bypass confirmation` in any context that applies to memory files.
2. Assert every mention of writing to `dark-factory/memory/` in the file appears AFTER a corresponding mention of developer sign-off / confirmation (proximity check: sign-off mention within 1000 characters preceding the write mention).
3. Assert the incremental-refresh subsection explicitly states that writes are deferred until per-entry sign-off is complete (no partial-batch writes).

## Expected Outcome
- No forbidden silent-write phrase present.
- Every write mention is preceded by a sign-off mention nearby.
- Incremental-refresh batching is explicit.

## Failure Mode (if applicable)
If a silent-write phrase is present, test prints the offending phrase and surrounding context. If write/sign-off proximity is violated, test prints the write mention and notes the preceding sign-off is too far away or missing.

## Notes
This is an adversarial test — its job is to catch text that the author accidentally wrote that would permit silent writes. It errs on the side of strictness. If it flags a legitimate phrase, the implementation should rephrase to avoid ambiguity.
