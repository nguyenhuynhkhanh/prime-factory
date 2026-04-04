# Scenario: Greenfield project produces "No code map" stub

## Type
edge-case

## Priority
high -- greenfield is a supported project state; onboard-agent already handles it for profile

## Preconditions
- Project directory has no source code (only Dark Factory scaffolding, package.json, etc.)
- No existing code-map.md

## Action
Run `/df-onboard` on the greenfield project.

## Expected Outcome
- Phase 3.5 detects no source files to scan
- No scanner agents are spawned
- code-map.md is created with content: "No code map -- no source code yet"
- This matches the greenfield handling pattern for project-profile.md
- Developer is still asked for confirmation (consistency with sign-off contract)

## Notes
Validates EC-1 and EH-1. Greenfield stub ensures agents that look for code-map.md find it and understand the project state.
