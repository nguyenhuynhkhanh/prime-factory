# Scenario: project-memory-template.md documents every field with type and required/optional marking

## Type
edge-case

## Priority
critical — if a field is missing from the template, downstream agents will emit malformed memory once they start writing real entries.

## Preconditions
- `dark-factory/templates/project-memory-template.md` exists.

## Action
Read the template file. For each file-type section (invariants, decisions, ledger), verify:

1. Every field from FR-8 (invariants), FR-9 (decisions), FR-10 (ledger) is documented by NAME.
2. Each documented field has an associated type hint (e.g., "list", "markdown", "ISO date", "enum", "spec name").
3. Each documented field is marked as required OR optional.
4. For enum fields (`source`, `status`, `domain`, `enforcement`), the allowed values are enumerated.
5. Exactly one complete valid example entry is given per file type.
6. Example entries use realistic content (not lorem ipsum) and populate every required field.
7. The template explicitly states "either `enforced_by` OR `enforcement` is required" for invariants (FR-11).
8. The template explicitly states that IDs are zero-padded 4-digit sequential (`INV-0001`), never reused, and assigned only by promote-agent (FR-12).

## Expected Outcome
- All eight checks above pass.
- If any field is missing, or any enum is under-specified, or the example entry omits a required field, the test fails with a clear diagnostic.

## Notes
Validates FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, EC-8. Catches the subtle failure where the template is technically present but incomplete.
