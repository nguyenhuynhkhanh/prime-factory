# Scenario: ledger.md contains meaningful FEAT-TEMPLATE entry and append-only note

## Type
feature

## Priority
high — TEMPLATE entry is the schema teaching example.

## Preconditions
- `dark-factory/memory/ledger.md` exists with valid frontmatter (see P-03).

## Action
Read `dark-factory/memory/ledger.md` and scan for (a) an append-only note near the top, (b) the `## FEAT-TEMPLATE:` heading.

## Expected Outcome
- The file contains a prominent append-only note (a phrase such as `append-only`, `never modified`, or `do not edit existing entries`) in its top prose section.
- Exactly one heading of the form `## FEAT-TEMPLATE: <name>` is present.
- The entry body includes bullet lines for every documented ledger field: `summary`, `promotedAt`, `introducedInvariants`, `introducedDecisions`, `promotedTests`, `gitSha`.

## Notes
Validates FR-5, FR-6, BR-2.
