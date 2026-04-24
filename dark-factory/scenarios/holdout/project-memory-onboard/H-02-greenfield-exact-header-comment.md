# Scenario: H-02 — Greenfield: header comment text is distinctive enough to be asserted

## Type
edge-case

## Priority
medium — BR-9, FR-9, FR-13, EC-8. The header comment content must be consistent across all three files so downstream consumers can recognize a greenfield-bootstrapped registry.

## Preconditions
- Phase 3.7 is present; greenfield fallback documented in all three sub-phases.

## Action
Structural test asserts:
1. All three sub-phases reference the SAME exact header comment template OR a close paraphrase with a distinctive stable phrase (e.g., the phrase `will accumulate as features are specced` or `memory will accumulate` — pick one and use it consistently across 3.7a, 3.7b, 3.7c).
2. Each file-specific header comment is tagged with the file's entity type (invariants / decisions / ledger) so a reader of the written file can tell what KIND of registry is empty.

## Expected Outcome
- The distinctive phrase appears in all three sub-phases.
- Each sub-phase qualifies the greenfield message with its entity type.

## Failure Mode (if applicable)
If the phrase varies significantly across sub-phases, test fails and highlights the diff.

## Notes
A consumer agent reading an empty `decisions.md` needs to distinguish "greenfield — no decisions yet" from "decisions file corrupted" from "decisions file was intentionally emptied by rejection". The header comment is the only signal.
