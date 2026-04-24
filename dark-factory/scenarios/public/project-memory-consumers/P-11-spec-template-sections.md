# Scenario: spec-template contains Invariants and Decisions sections with full subsection structure

## Type
feature

## Priority
high — the template is the scaffold spec-agent fills

## Preconditions
- `dark-factory/templates/spec-template.md` has been updated per this spec

## Action
Inspect the contents of `dark-factory/templates/spec-template.md` and its plugin mirror.

## Expected Outcome
- The file contains `## Invariants` section with the subsections:
  - `### Preserves`
  - `### References`
  - `### Introduces`
  - `### Modifies`
  - `### Supersedes`
- Each subsection includes example prose showing how to fill it (IDs, fields, rationale).
- The `### Introduces` example shows the TBD placeholder form (`INV-TBD-a`) and all required fields (title, rule, scope, domain, enforced_by | enforcement, rationale).
- The file contains `## Decisions` section with the subsections:
  - `### References`
  - `### Introduces`
  - `### Supersedes`
- (No `Preserves` / `Modifies` for decisions — decisions are historical; they are either referenced or superseded, never "modified.")
- Empty-case prose: each subsection shows the "None — ..." line convention for empty sections.
- The plugin mirror `plugins/dark-factory/templates/spec-template.md` contains byte-identical content.

## Notes
Validates FR-15, AC-10. Contract tests enforce the mirror parity.
