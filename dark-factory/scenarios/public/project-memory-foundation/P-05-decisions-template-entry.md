# Scenario: decisions.md contains meaningful DEC-TEMPLATE entry

## Type
feature

## Priority
high — TEMPLATE entry is the schema teaching example.

## Preconditions
- `dark-factory/memory/decisions.md` exists with valid frontmatter (see P-03).

## Action
Read `dark-factory/memory/decisions.md` and scan for the `## DEC-TEMPLATE:` heading.

## Expected Outcome
- Exactly one heading of the form `## DEC-TEMPLATE: <title>` is present.
- The title after the colon is non-empty and meaningful.
- The entry body includes bullet lines for every documented decisions field: `context`, `decision`, `rationale`, `alternatives`, `status`, `supersededBy`, `introducedBy`, `introducedAt`, `domain`, `referencedBy`.

## Notes
Validates FR-4, FR-6.
