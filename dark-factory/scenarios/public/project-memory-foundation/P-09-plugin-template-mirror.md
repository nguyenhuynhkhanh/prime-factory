# Scenario: Plugin mirrors match source for all new/changed templates and rule

## Type
feature

## Priority
critical — plugin mirror is the distribution target; any drift breaks the installed framework in user projects.

## Preconditions
- Source files exist at `dark-factory/templates/project-memory-template.md`, `dark-factory/templates/project-profile-template.md`, `.claude/rules/dark-factory-context.md`.
- Plugin mirror files exist at `plugins/dark-factory/templates/project-memory-template.md`, `plugins/dark-factory/templates/project-profile-template.md`, `plugins/dark-factory/.claude/rules/dark-factory-context.md`.

## Action
For each source file, read its content. Read the corresponding plugin file. Compare byte-for-byte.

## Expected Outcome
- `dark-factory/templates/project-memory-template.md` matches `plugins/dark-factory/templates/project-memory-template.md` exactly.
- `dark-factory/templates/project-profile-template.md` matches `plugins/dark-factory/templates/project-profile-template.md` exactly.
- `.claude/rules/dark-factory-context.md` matches `plugins/dark-factory/.claude/rules/dark-factory-context.md` exactly.

## Notes
Validates FR-15, FR-19, BR-7. Contract tests already run literal byte comparison for agents and skills; this scenario extends the same pattern to the new memory template and rule change.
