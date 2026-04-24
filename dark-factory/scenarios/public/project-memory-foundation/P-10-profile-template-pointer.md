# Scenario: project-profile-template.md contains pointer to memory, preserves existing Invariants bullet

## Type
feature

## Priority
high — profile readers need to know where canonical invariants live.

## Preconditions
- `dark-factory/templates/project-profile-template.md` exists.

## Action
Read the project profile template and inspect the Business Domain Entities section.

## Expected Outcome
- The Business Domain Entities section contains a pointer note referencing `dark-factory/memory/invariants.md` as the canonical invariant registry.
- The existing `- **Invariants**: ...` bullet line is still present as a human-readable summary (NOT removed).
- The rest of the template (Overview, Tech Stack, Architecture, etc.) is unchanged except for the pointer addition.

## Notes
Validates FR-16. The profile template change is additive — no existing content is removed.
