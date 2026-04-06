# Scenario: H-19 — page beyond total returns empty events, correct pagination, no 404

## Type
edge-case

## Priority
medium — programmatic pagination must not 404 when stepping past the last page

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 15 events exist within last 7 days

## Action
```
GET /api/v1/dashboard/events?page=5&limit=10
Cookie: session=<valid-cto-session>
```
(page 5 at limit 10 requires at least 41 events; only 15 exist — offset 40, but only 15 rows)

## Expected Outcome
- Status: 200 (not 404)
- `events` array is empty: `[]`
- `pagination`:
  ```json
  {
    "page": 5,
    "limit": 10,
    "total": 15,
    "hasMore": false
  }
  ```
- `pagination.total` correctly shows 15 (all matching rows), not 0
- `hasMore` is false

## Notes
Verifies EC-6. A 404 would break programmatic pagination loops that step forward until `hasMore=false`. The empty events array + total tells the client it has stepped past the end.
