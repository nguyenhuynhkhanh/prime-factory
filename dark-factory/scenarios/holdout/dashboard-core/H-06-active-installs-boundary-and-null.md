# Scenario H-06: Active installs count boundary — exact 30-day threshold and NULL last_seen_at

## Type
edge-case

## Priority
high — off-by-one on the threshold, or incorrect NULL handling, silently corrupts the primary metric.

## Preconditions
- A CTO user has a valid session cookie.
- Current Unix timestamp at query time: `T` (seconds).
- The org has 3 installs:
  - Install A: `last_seen_at = T - (30 * 24 * 60 * 60)` — exactly at the boundary (NOT active: strictly greater-than).
  - Install B: `last_seen_at = T - (30 * 24 * 60 * 60) + 1` — one second inside the window (active).
  - Install C: `last_seen_at = NULL` — never seen (NOT active).

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<valid-token>
```

## Expected Outcome
HTTP 200 with:
```json
{ "activeInstalls": 1, ... }
```
- Only Install B is counted.
- Install A (at the exact boundary) is excluded (strictly `>`).
- Install C (NULL) is excluded (NULL does not satisfy `> threshold` in SQL).

## Failure Mode
- If `activeInstalls = 2`: the boundary comparison is `>=` instead of `>` (off-by-one).
- If `activeInstalls = 3`: NULL handling is broken.
- If `activeInstalls = 0`: the threshold calculation is wrong (too aggressive).

## Notes
SQL: `WHERE last_seen_at > ?` correctly excludes NULL (SQL NULL comparisons always yield NULL/false). No explicit `AND last_seen_at IS NOT NULL` is needed, but it can be added for clarity.
