# Scenario: P-02 — Phase 3.7 contains three labeled sub-steps

## Type
feature

## Priority
critical — AC-2 explicitly requires three labeled sub-sections. Tests must enforce their presence by name.

## Preconditions
- Updated `.claude/agents/onboard-agent.md` with Phase 3.7 written.
- Mirror copy in `plugins/dark-factory/agents/onboard-agent.md`.

## Action
Structural test asserts that `.claude/agents/onboard-agent.md` contains ALL of the following substrings:
- `3.7a Invariants Extraction` (or `3.7a: Invariants Extraction`)
- `3.7b Decisions Seeding` (or `3.7b: Decisions Seeding`)
- `3.7c Ledger Retro-Backfill` (or `3.7c: Ledger Retro-Backfill`)

And that these substrings appear within the Phase 3.7 section body (i.e., after the `### Phase 3.7: Memory Extraction` heading and before the next `### Phase` heading).

## Expected Outcome
- All three substrings present.
- All three appear inside Phase 3.7's body (not in some other phase).
- Order within Phase 3.7: 3.7a → 3.7b → 3.7c (ascending sub-letter).
- Mirror file passes the same assertion.

## Failure Mode (if applicable)
If any sub-step is missing or out of order, the test must name the missing/misplaced label.

## Notes
Matching is case-sensitive on the labels `3.7a`, `3.7b`, `3.7c`. The descriptive suffix (`Invariants Extraction`, etc.) is a fixed phrase used for discoverability.
