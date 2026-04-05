# Scenario: --rebuild shows diff against existing registry before overwriting

## Type
edge-case

## Priority
high — destructive operation requires confirmation

## Preconditions
- `dark-factory/promoted-tests.json` exists with entries for `feature-a` and `feature-b`
- Codebase annotations only match `feature-a` and `feature-c` (feature-b annotations were removed, feature-c is new)

## Action
Developer runs `/df-cleanup --rebuild`

## Expected Outcome
- Scans codebase, finds annotations for `feature-a` and `feature-c`
- Shows diff to developer:
  - Kept: `feature-a`
  - Removed: `feature-b` (annotation no longer in codebase)
  - Added: `feature-c` (found in codebase, not in registry)
- Waits for developer confirmation
- If confirmed: overwrites registry with `feature-a` and `feature-c` entries
- If rejected: preserves existing registry unchanged

## Notes
EC-8: Atomic overwrite with confirmation. BR-8: Fields like holdoutScenarioCount are null for rebuilt entries.
