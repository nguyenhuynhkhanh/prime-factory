# Scenario: H-25 — Developer accepts all invariants but rejects all decisions

## Type
edge-case

## Priority
medium — EC-17. Per-batch independence must be preserved.

## Preconditions
- Phase 7 Memory Sign-Off is documented.

## Action
Structural test asserts the sign-off documentation:
1. Each of the three batches is processed independently — accept-all in one batch has no bearing on the other two.
2. If invariants batch results in N accepted entries and decisions batch results in 0 accepted entries:
   - `invariants.md` is written with N entries + frontmatter.
   - `decisions.md` is written with 0 entries + header comment + frontmatter (NOT skipped, NOT absent — the file MUST exist so consumers can detect "no decisions yet" vs "file missing").
3. The ledger batch result is similarly independent.

## Expected Outcome
- Independence documented.
- Written-even-if-empty rule documented for all three files.
- Consumers can always rely on files existing post-onboard (unless foundation is absent — BR-10 / EC-1).

## Failure Mode (if applicable)
If the documentation would skip writing an empty file, test fails — consumers depend on file existence as a bootstrap signal.

## Notes
This is critical for consumer agents: they should not have to distinguish "file absent" from "file empty" in the common case. The foundation sub-spec defines the file schema; empty files with headers are valid per schema.
