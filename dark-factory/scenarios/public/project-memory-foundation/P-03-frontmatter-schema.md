# Scenario: Each memory file has valid frontmatter with required keys

## Type
feature

## Priority
critical — without valid frontmatter, downstream parsers cannot determine schema version.

## Preconditions
- All three memory files exist (see P-02).

## Action
Read each of `invariants.md`, `decisions.md`, `ledger.md`. Parse the YAML frontmatter block delimited by `---` at the top of the file using the same `parseFrontmatter()` helper used in the existing test files.

## Expected Outcome
- Each file's frontmatter parses without error.
- Each file's frontmatter contains: `version` (value `1`), `lastUpdated` (non-empty string), `generatedBy` (non-empty string), `gitHash` (non-empty string).

## Notes
Validates FR-2, NFR-3. Uses the existing frontmatter parsing helper (no new parsing deps).
