# Scenario: tests/dark-factory-setup.test.js asserts memory foundation structure

## Type
feature

## Priority
critical — without structural tests, regressions in later sub-specs can silently delete or corrupt memory without being caught.

## Preconditions
- `tests/dark-factory-setup.test.js` exists.

## Action
Read the setup test file and verify that it contains new assertions related to the memory foundation.

## Expected Outcome
- At least one `describe` block (or equivalent grouping) covers the memory foundation.
- Assertions exist that check: (a) `dark-factory/memory/` directory exists, (b) each of the three memory files exists, (c) each memory file has parseable YAML frontmatter with required keys (`version`, `lastUpdated`, `generatedBy`, `gitHash`), (d) each memory file contains its respective TEMPLATE entry heading, (e) `dark-factory/templates/project-memory-template.md` exists and documents every field in FR-8 / FR-9 / FR-10, (f) `.claude/rules/dark-factory-context.md` references `dark-factory/memory/` and mentions each of the three memory files, (g) `dark-factory/memory/` is NOT listed in `.gitignore`.
- Running `node --test tests/` passes.

## Notes
Validates FR-18. The test file grows; existing tests unrelated to memory are not modified.
