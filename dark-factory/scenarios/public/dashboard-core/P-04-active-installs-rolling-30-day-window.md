# Scenario P-04: Active installs count uses a rolling 30-day window

## Type
feature

## Priority
high — the "active" definition is the primary metric shown on the dashboard.

## Preconditions
- A CTO user exists with a valid, unexpired session cookie.
- The org has 4 installs:
  - Install A: `last_seen_at` = 5 days ago (active)
  - Install B: `last_seen_at` = 29 days ago (active — within window)
  - Install C: `last_seen_at` = 31 days ago (inactive — outside window)
  - Install D: `last_seen_at` = NULL (inactive — never seen)

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<valid-token>
```

## Expected Outcome
HTTP 200 with:
```json
{
  "activeInstalls": 2,
  ...
}
```
- Only installs A and B are counted.
- Install C (31 days ago) and Install D (NULL) are excluded.

## Failure Mode
N/A — read only.

## Notes
The 30-day threshold is `Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)`. D1 stores timestamps as Unix integer seconds. The comparison is `last_seen_at > threshold` (strictly greater than).
