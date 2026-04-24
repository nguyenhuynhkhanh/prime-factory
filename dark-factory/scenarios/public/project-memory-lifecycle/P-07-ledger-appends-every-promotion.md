# Scenario: ledger appends a FEAT-NNNN row on every successful promotion

## Type
feature

## Priority
critical — ledger is the authoritative feature history.

## Preconditions
- Spec is being promoted (may declare zero or many invariants/decisions).
- `dark-factory/memory/ledger.md` exists.
- promote-agent.md edited.

## Action
Read promote-agent.md's ledger-append documentation.

## Expected Outcome
- A FEAT-NNNN entry is appended to `ledger.md` on EVERY successful promotion (regardless of whether invariants/decisions were declared).
- Fields populated: `name` (spec name), `summary` (from spec Context or Summary), `promotedAt` (ISO now), `introducedInvariants` (list of newly-assigned INV IDs — possibly `[]`), `introducedDecisions` (list — possibly `[]`), `promotedTests` (list of test paths from this promotion), `gitSha` (commit-before cleanup commit — see P-09).
- The ledger FEAT IDs follow the same next-sequential rule (FEAT-NNNN = max + 1).

## Notes
Covers FR-7, BR-3, EC-6 (zero-decl spec still appends).
