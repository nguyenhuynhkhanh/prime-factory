# Scenario: Re-promotion of same feature overwrites existing registry entry

## Type
edge-case

## Priority
high — re-runs happen after failures

## Preconditions
- `dark-factory/promoted-tests.json` has an entry for `user-auth` from a previous promotion
- promote-agent runs again for `user-auth` (e.g., after a failed first attempt that was retried)

## Action
Promote-agent completes Step 7 (Update Registry)

## Expected Outcome
- Reads existing registry
- Finds existing entry with `"feature": "user-auth"`
- OVERWRITES the existing entry (does not create a duplicate)
- The `promotedTests` array still has exactly one entry for `user-auth`
- The `promotedAt` timestamp is updated to the new promotion time
- File paths may have changed (different test placement)

## Notes
EC-4: Same feature promoted twice. The entry is replaced, not appended. This prevents duplicate entries that would cause double-counting in health checks.
