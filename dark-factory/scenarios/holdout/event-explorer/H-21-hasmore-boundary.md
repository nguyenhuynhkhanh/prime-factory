# Scenario: H-21 — hasMore boundary: exactly 50 events vs exactly 51 events

## Type
edge-case

## Priority
high — off-by-one in hasMore causes the UI to show/hide the next-page button incorrectly

## Preconditions — Part A
- CTO authenticated; `orgId = "org-acme"`
- Exactly 50 events within last 7 days

## Preconditions — Part B
- CTO authenticated; `orgId = "org-acme"`
- Exactly 51 events within last 7 days

## Action — Part A
```
GET /api/v1/dashboard/events?page=1&limit=50
Cookie: session=<valid-cto-session>
```

## Action — Part B
```
GET /api/v1/dashboard/events?page=1&limit=50
Cookie: session=<valid-cto-session>
```

## Expected Outcome — Part A (exactly 50 events)
- `events` array contains 50 items
- `pagination`:
  ```json
  { "page": 1, "limit": 50, "total": 50, "hasMore": false }
  ```
- `hasMore` is `false` — exactly one full page, no next page

## Expected Outcome — Part B (exactly 51 events)
- `events` array contains 50 items (first page)
- `pagination`:
  ```json
  { "page": 1, "limit": 50, "total": 51, "hasMore": true }
  ```
- `hasMore` is `true` — there is 1 event on page 2

## Notes
Verifies EC-12, EC-13. The `hasMore` calculation is `(page * limit) < total`. For Part A: `1 * 50 < 50` = false. For Part B: `1 * 50 < 51` = true. An off-by-one would flip `hasMore` in one of these cases.
