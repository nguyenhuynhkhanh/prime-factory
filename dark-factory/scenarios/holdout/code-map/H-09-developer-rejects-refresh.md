# Scenario: Developer rejects code map refresh -- existing map preserved

## Type
edge-case

## Priority
high -- existing data must not be destroyed on rejected refresh

## Preconditions
- Existing code-map.md from a previous onboard run with valid content
- Developer runs `/df-onboard` again, triggering a refresh
- Onboard-agent generates new code map and shows diff

## Action
Developer reviews the diff and rejects the refresh.

## Expected Outcome
- Existing code-map.md is preserved UNCHANGED (byte-for-byte)
- No partial overwrite or corruption
- project-profile.md reference link to code-map.md is preserved as-is
- Onboard-agent reports that the refresh was rejected
- Code map is treated as atomic for accept/reject (BR-8) -- developer cannot accept some changes and reject others

## Notes
Validates BR-8, EC-14, and EH-11. This is the reverse transition of the incremental refresh flow.
