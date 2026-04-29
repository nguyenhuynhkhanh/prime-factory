# Raw Spec: Bugfix Missing Migration Pattern

**Status:** raw — not yet through /df-intake

## Observed behavior

When a bug is fixed that changes a data format (adding required fields like `id` or `createdAt` to log entries), the fix is applied to new writes only. Existing records in the data file (e.g. `interactions.ndjson`) are left in the old format.

Result: old entries still exhibit the broken behavior (e.g. `data-interaction-id="undefined"`, broken expand, sort crash) even after the "fix" ships.

## Concrete example

- Bug: interaction log entries written without `id` or `createdAt`
- Fix: new entries now get `id = runId` and `createdAt = timestamp`
- Missed: no migration for existing `interactions.ndjson` entries → DOM query still matches wrong card, sort still crashes on old entries
- Developer note in fix: "Any old entries in interactions.ndjson without id will still have broken expand behaviour — you can clear that file to start fresh if needed."

## Pattern

Code fix + data migration are two separate concerns. When a bugfix changes a stored data schema, the fix is incomplete without:
1. A migration script or one-time backfill
2. OR a reader that tolerates missing fields (defensive read with defaults)
3. OR an explicit "clear old data" instruction surfaced to the user (not just a comment)

## Questions for spec

- Is this a Dark Factory pipeline gap (red-green test only covered new writes, not existing data)?
- Should bugfix specs require an explicit "migration or tolerance strategy" section?
- Should the test-agent include a scenario that seeds old-format data before running the fix?
