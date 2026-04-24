# Scenario: df-cleanup on a repo without memory/ directory → skip health check, continue

## Type
edge-case

## Priority
medium — greenfield / pre-onboard tolerance.

## Preconditions
- `dark-factory/memory/` does NOT exist.
- `dark-factory/manifest.json` and `dark-factory/promoted-tests.json` exist (normal state).

## Action
`/df-cleanup` runs.

## Expected Outcome
- Memory Health Check step detects the absent directory.
- Emits: "Memory not yet onboarded — skipping health check. Run `/df-onboard` to initialize." (or equivalent).
- Cleanup CONTINUES with other steps (stuck-feature retry, manifest cleanup, etc.).
- No crash, no block, no error exit.

## Notes
Covers EC-21. Matches the broader "missing memory is non-blocking" pattern (foundation DEC-TBD-f).
