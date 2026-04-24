# Scenario: H-04 — promoted-tests.json corrupted or wrong shape: ledger degrades soft

## Type
failure-recovery

## Priority
high — FR-14. A hand-corrupted registry must not halt onboarding.

## Preconditions
- Phase 3.7c is present.

## Action
Structural test asserts Phase 3.7c documents at least three corruption modes and their handling:
1. **File exists but is not valid JSON**: skip ledger backfill; write empty ledger with `[LEDGER CORRUPTED]` comment; include in sign-off summary.
2. **File is valid JSON but does not match expected shape** (e.g., missing `promotedTests` array, wrong `version`): same handling — skip, empty, flag.
3. **File is valid but an individual entry is malformed** (e.g., missing `feature` name): skip that entry only, continue with the rest, include a per-entry warning in sign-off summary.

The test must also verify the body contains an explicit prohibition on auto-repairing `promoted-tests.json` — onboard must not overwrite the registry.

## Expected Outcome
- All three corruption modes documented.
- No-auto-repair rule documented.
- Sign-off summary flags the defect so the developer sees it.

## Failure Mode (if applicable)
If any corruption mode is not handled, test names it. If the documentation suggests repairing the file, test fails — that is out of scope for this feature.

## Notes
`promoted-tests.json` is written by promote-agent. Onboard-agent is strictly a reader. Any repair belongs in a dedicated `/df-cleanup --rebuild` flow, not here.
