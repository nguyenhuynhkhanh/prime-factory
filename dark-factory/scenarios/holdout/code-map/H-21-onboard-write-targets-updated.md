# Scenario: Onboard-agent Constraints section allows writing code-map.md

## Type
feature

## Priority
critical -- without this update, the onboard-agent would violate its own constraints when writing the code map

## Preconditions
- onboard-agent.md has a Constraints section that currently says "ONLY write to `dark-factory/project-profile.md` and `.claude/settings.json`"

## Action
Read the updated onboard-agent.md Constraints section.

## Expected Outcome
- Constraints section now includes `dark-factory/code-map.md` in the list of allowed write targets
- The constraint reads something like: "ONLY write to `dark-factory/project-profile.md`, `dark-factory/code-map.md`, and `.claude/settings.json`"
- The existing constraint about never modifying source code is preserved
- The existing constraint about never modifying test files is preserved

## Notes
This is a structural invariant -- if the write target is not explicitly allowed, the onboard-agent's own rules would prevent it from writing the code map. This is flagged in the Implementation Notes.
