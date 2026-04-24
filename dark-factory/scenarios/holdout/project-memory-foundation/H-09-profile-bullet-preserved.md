# Scenario: project-profile-template.md Invariants bullet is preserved verbatim

## Type
regression

## Priority
high — existing tests and existing onboarded projects depend on the "Invariants" bullet being present under Business Domain Entities.

## Preconditions
- `dark-factory/templates/project-profile-template.md` exists with the pointer-note change applied.

## Action
Read the project profile template. Locate the Key Business Domain Entities section.

## Expected Outcome
- The bullet line that starts with `- **Invariants**:` is STILL present.
- The bullet's content (the examples in curly braces) has NOT been removed, renamed, or replaced — it is a human-readable summary as it was before.
- The new pointer-note referencing `dark-factory/memory/invariants.md` is ADDED (e.g., as a new line after the bullet or as a brief parenthetical note), NOT replacing the bullet.
- All other sections of the template (Overview, Tech Stack, Architecture, Testing, Common Gotchas, For New Features, For Bug Fixes, Developer Notes, etc.) are unchanged.

## Notes
Validates FR-16. Catches the failure mode where a code-agent "tidies up" and deletes the original Invariants bullet.
