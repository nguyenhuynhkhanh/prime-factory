# Scenario: dark-factory-context.md rule references memory directory

## Type
feature

## Priority
critical — if the rule does not reference memory, no downstream agent will load it.

## Preconditions
- `.claude/rules/dark-factory-context.md` exists.

## Action
Read the rule file.

## Expected Outcome
- The file references `dark-factory/memory/` as an always-load context source.
- The file mentions each of `invariants.md`, `decisions.md`, `ledger.md` (each of the three memory files is enumerated).
- The file includes prose stating that missing memory files are non-blocking (warn and proceed) — matching the existing pattern for missing `project-profile.md`.
- The existing three bullets (project-profile, code-map, manifest) are still present and unchanged.

## Notes
Validates FR-13, FR-14. The rule is the ENTRY POINT for all agents that load project context.
