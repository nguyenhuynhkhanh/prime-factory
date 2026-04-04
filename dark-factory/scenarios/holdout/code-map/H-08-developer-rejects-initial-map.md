# Scenario: Developer rejects code map on initial generation

## Type
edge-case

## Priority
high -- rejection must be handled gracefully; no orphaned files

## Preconditions
- No existing code-map.md
- Onboard-agent has completed scanning and presents the code map

## Action
Developer says the code map is wrong or not useful and rejects it.

## Expected Outcome
- code-map.md is NOT written to disk
- No partial or empty code-map.md file created
- project-profile.md is NOT updated with a code map reference link
- Onboard-agent reports that the code map was rejected
- The rest of the onboarding process (Phase 4+) continues unaffected

## Notes
Validates BR-7 (sign-off required), EC-13, and EH-10.
