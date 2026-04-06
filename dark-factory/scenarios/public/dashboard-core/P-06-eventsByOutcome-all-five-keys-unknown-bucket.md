# Scenario P-06: eventsByOutcome includes all five keys, unknown bucket for NULL outcomes

## Type
feature

## Priority
high — NULL outcome is a real-world condition (CLI interrupted mid-run).

## Preconditions
- A CTO user exists with a valid, unexpired session cookie.
- The org has 5 events:
  - 2 events with `outcome = "success"`
  - 1 event with `outcome = "failed"`
  - 2 events with `outcome = NULL`

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<valid-token>
```

## Expected Outcome
HTTP 200 with:
```json
{
  "totalEvents": 5,
  "eventsByOutcome": {
    "success": 2,
    "failed": 1,
    "blocked": 0,
    "abandoned": 0,
    "unknown": 2
  },
  ...
}
```
- All five keys are present.
- `blocked` and `abandoned` are 0 (not missing from the object).
- `unknown` is 2 (the two NULL-outcome events).
- `totalEvents` equals 5 = 2 + 1 + 0 + 0 + 2.

## Failure Mode
N/A — read only.

## Notes
The route handler must not rely on the D1 GROUP BY result containing a NULL key. After fetching the aggregate rows, it must initialize the outcome map with all five keys set to 0, then iterate the result rows and increment. Rows where `outcome IS NULL` increment the `unknown` key.
