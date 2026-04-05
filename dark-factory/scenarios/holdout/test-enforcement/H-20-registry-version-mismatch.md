# Scenario: Health check handles registry with higher version number

## Type
edge-case

## Priority
medium — forward compatibility

## Preconditions
- `dark-factory/promoted-tests.json` exists with `"version": 2`
- Current code only understands version 1
- The `promotedTests` array has entries in a format compatible with version 1

## Action
Developer runs `/df-cleanup`

## Expected Outcome
- Health check reads the registry
- Detects `version: 2` is higher than supported `1`
- Warns: "Registry version 2 is newer than supported (1). Some fields may be ignored."
- Continues health check with best-effort parsing of known fields
- Does NOT error out or refuse to check

## Notes
EC-12: Forward compatibility. NFR-3 specifies the registry format must be forward-compatible.
