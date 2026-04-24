# Scenario: invariants.md contains meaningful INV-TEMPLATE entry

## Type
feature

## Priority
high — TEMPLATE entry is the schema teaching example.

## Preconditions
- `dark-factory/memory/invariants.md` exists with valid frontmatter (see P-03).

## Action
Read `dark-factory/memory/invariants.md` and scan for the `## INV-TEMPLATE:` heading.

## Expected Outcome
- Exactly one heading of the form `## INV-TEMPLATE: <title>` is present.
- The title after the colon is non-empty and does not match `TODO`, `TBD`, or empty placeholder gibberish.
- The entry body includes bullet lines for every documented invariants field: `rule`, `scope.modules`, `scope.entities`, `source`, `sourceRef`, `status`, `supersededBy`, `introducedBy`, `introducedAt`, `rationale`, `domain`, one of (`enforced_by` OR `enforcement`), `guards`, `referencedBy`.

## Notes
Validates FR-3, FR-6. Every field must be populated (real placeholder or the literal token `TBD`) — no field may be omitted.
