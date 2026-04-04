# Scenario: Developer must confirm code map before it is written to disk

## Type
feature

## Priority
critical -- writing without confirmation violates the developer sign-off contract

## Preconditions
- Onboard-agent has completed Phase 3.5 scanning and synthesis
- Code map content has been generated in memory

## Action
Onboard-agent presents the generated code map to the developer and asks for confirmation.

## Expected Outcome
- Developer is shown the full code map content before any file is written
- Developer is asked: "Does this look right? I'll write it to dark-factory/code-map.md once you confirm."
- If developer confirms: code-map.md is written to disk
- If developer requests changes: code map is revised and re-presented
- code-map.md is NOT written until explicit developer confirmation

## Notes
Validates FR-8 and BR-7. Same flow as project-profile.md confirmation.
