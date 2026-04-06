# Scenario H-07: All events have NULL outcome — unknown bucket equals totalEvents

## Type
edge-case

## Priority
high — this is EC-3. A pipeline where every CLI run is interrupted would produce this state.

## Preconditions
- A CTO user has a valid session cookie.
- The org has 3 installs (all active).
- The org has 8 events, all with `outcome = NULL`.

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<valid-token>
```

## Expected Outcome
HTTP 200 with:
```json
{
  "activeInstalls": 3,
  "totalEvents": 8,
  "eventsByOutcome": {
    "success": 0,
    "failed": 0,
    "blocked": 0,
    "abandoned": 0,
    "unknown": 8
  },
  ...
}
```
- `unknown` equals `totalEvents`.
- All four schema-defined outcome keys are 0 (not missing).

## Failure Mode
- If `unknown = 0`: NULL outcomes are being dropped instead of bucketed.
- If any schema-defined key is missing: the zero-initialization logic is incorrect.
- If `totalEvents != 8`: total count is incorrectly filtering out NULL-outcome rows.

## Notes
The D1 `GROUP BY command, outcome` result will contain rows where `outcome` is NULL. SQLite returns NULL as a key in GROUP BY results. The route handler must check `row.outcome === null` (or `=== undefined`, depending on the D1 binding's behavior) and map it to the `unknown` key.
