# Scenario: Legacy spec (no memory sections) passes architect review as SUGGESTION only

## Type
edge-case

## Priority
high — migration compatibility guarantee

## Preconditions
- Memory registry is populated
- A spec authored BEFORE this feature shipped is handed to architect review (e.g., pipeline restart, retroactive review). The spec has NO `## Invariants` and NO `## Decisions` sections.
- All three domain architects spawn

## Action
Architects perform Step 1 Deep Review. The probe step finds no memory sections in the spec.

## Expected Outcome
- Each domain review emits in its findings:
  ```
  Memory Findings (<domain>):
  - Preserved: none
  - Modified (declared in spec): none
  - Potentially violated (BLOCKER): none (spec predates memory sections — probe limited to codebase evidence)
  - New candidates declared: none
  - Orphaned (SUGGESTION only): none
  - SUGGESTION: Spec uses legacy template — memory sections absent. If new invariants are introduced, request spec update via respawn.
  ```
- Review Status: `APPROVED` or `APPROVED WITH NOTES` — never `BLOCKED` on account of missing sections.
- If the codebase-evidence probe (the architect still reads the codebase and looks for obvious violations of known invariants) finds a violation, THAT is reported as BLOCKER — but missing-sections alone is never the trigger.

## Notes
Validates Migration & Deployment section, EC-12. Migration compatibility is mandatory — without it, rolling this feature out would immediately block every in-flight legacy spec.
