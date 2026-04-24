# Scenario: Out-of-scope files are not touched by this spec

## Type
regression

## Priority
critical — scope discipline. The other three sub-specs (`project-memory-onboard`, `project-memory-consumers`, `project-memory-lifecycle`) must land on clean ground. If this spec bleeds into their territory, the wave plan breaks.

## Preconditions
- The branch that lands this spec is checked out.
- A git baseline ref (e.g., `main` or the commit before this spec) is available.

## Action
Run `git diff --name-only <baseline>..HEAD` on the branch that lands this spec. Inspect the list of changed files.

## Expected Outcome
- NO file under `.claude/agents/` is modified or added.
- NO file under `plugins/dark-factory/agents/` is modified or added.
- NO file under `.claude/skills/` is modified or added.
- NO file under `plugins/dark-factory/skills/` is modified or added.
- `dark-factory/templates/spec-template.md` is NOT modified.
- `dark-factory/templates/debug-report-template.md` is NOT modified.
- `plugins/dark-factory/templates/spec-template.md` is NOT modified.
- `plugins/dark-factory/templates/debug-report-template.md` is NOT modified.
- `dark-factory/manifest.json` is NOT modified beyond standard manifest bookkeeping if any (if the implementation accidentally edited it, flag).
- `dark-factory/promoted-tests.json` is NOT modified.
- `.claude/rules/dark-factory.md` is NOT modified.
- `plugins/dark-factory/.claude/rules/dark-factory.md` and `plugins/dark-factory/rules/dark-factory-context.md` MAY be modified only to mirror the source `.claude/rules/dark-factory-context.md` change.

## Notes
Validates AC-9, AC-10, AC-11, AC-12 and the "Files you MUST NOT touch" directive. Acts as the enforcement mechanism for wave-plan discipline — if this scenario fails, the foundation spec has leaked into another sub-spec's territory.
