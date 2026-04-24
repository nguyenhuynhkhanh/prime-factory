# Scenario: Spec with zero invariants AND zero decisions still appends FEAT entry

## Type
edge-case

## Priority
high — silent gaps in the ledger undermine its forensic value.

## Preconditions
- Spec contains `## Invariants` section but both `Introduces`, `Modifies`, `Supersedes`, `References` are empty (or entire section absent).
- Same for `## Decisions`.
- Spec is being promoted.

## Action
promote-agent runs.

## Expected Outcome
- `ledger.md` gains a FEAT-NNNN entry.
- `introducedInvariants: []`, `introducedDecisions: []`.
- `name`, `summary`, `promotedAt`, `promotedTests`, `gitSha` all populated.
- No entries written to invariants.md or decisions.md.
- Zero-decl is not treated as a no-op — the ledger records the promotion.

## Notes
Covers FR-7, BR-3, EC-6. The invariant is "ledger grows by exactly one row per successful promotion, always".
