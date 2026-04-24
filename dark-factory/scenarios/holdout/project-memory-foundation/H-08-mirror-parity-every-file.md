# Scenario: Plugin mirror parity — every new or changed file has an exact mirror

## Type
concurrency

## Priority
critical — plugin mirror drift is the most common and silent failure in this codebase.

## Preconditions
- Source files at `dark-factory/templates/project-memory-template.md`, `dark-factory/templates/project-profile-template.md`, and `.claude/rules/dark-factory-context.md` exist.
- Plugin mirror directory `plugins/dark-factory/` exists.

## Action
For each of the three source files above, compute a byte-for-byte equality check against its plugin mirror:

1. `dark-factory/templates/project-memory-template.md` == `plugins/dark-factory/templates/project-memory-template.md`
2. `dark-factory/templates/project-profile-template.md` == `plugins/dark-factory/templates/project-profile-template.md`
3. `.claude/rules/dark-factory-context.md` == `plugins/dark-factory/.claude/rules/dark-factory-context.md`

Additionally, assert the tests in `tests/dark-factory-contracts.test.js` contain NEW parity assertions for the memory template (i.e., a test named or describing mirror parity of `project-memory-template.md`).

## Expected Outcome
- All three byte-for-byte comparisons match exactly.
- `tests/dark-factory-contracts.test.js` contains an assertion referencing `project-memory-template.md` mirror parity.
- `node --test tests/` passes.

## Notes
Validates FR-15, FR-19, BR-7, EC-4, EC-9. This is the principal regression risk for this spec; catches it both in implementation and in the new contract test.
