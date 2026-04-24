# Scenario: H-09 — Deterministic re-run produces identical candidate IDs and order

## Type
edge-case

## Priority
high — NFR-2. Non-deterministic output makes diffs meaningless.

## Preconditions
- Phase 3.7 is present.

## Action
Structural test asserts Phase 3.7 documents:
1. Candidate IDs in a single session use a monotonic counter (`CANDIDATE-1, CANDIDATE-2, ...`) that resets per session but is assigned **deterministically** based on scan order (file-alphabetical, then line-ascending).
2. The order candidates are presented during sign-off is deterministic (documented scan order).
3. The order of entries written to each memory file is deterministic (e.g., written in permanent-ID ascending order, which corresponds to acceptance order within the sign-off batch).

The test verifies the word `deterministic` or an equivalent (`stable order`, `reproducible`, `file-alphabetical`) appears in the documentation of at least one of these three ordering rules.

## Expected Outcome
- At least one ordering rule is explicitly documented as deterministic.
- Scan order (file-alphabetical, line-ascending) is named.
- Presentation and write order are implied by scan order.

## Failure Mode (if applicable)
If no ordering rule is documented deterministically, test fails. If scan order is described vaguely ("scan the codebase") without an explicit order, test flags it as non-deterministic.

## Notes
Two runs on the same codebase must propose the same candidates in the same order. Otherwise the incremental-refresh diff becomes noise.
