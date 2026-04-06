# Scenario: P-10 — Pagination returns correct page slice and pagination metadata

## Type
feature

## Priority
critical — numbered pagination is a core UI requirement

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 120 events exist for org-acme within the last 7 days (seeded with predictable `startedAt` values: T-1 through T-120, T-1 being most recent)

## Action
```
GET /api/v1/dashboard/events?page=2&limit=50
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains exactly 50 items (events ranked 51–100 by startedAt DESC)
- `pagination`:
  ```json
  {
    "page": 2,
    "limit": 50,
    "total": 120,
    "hasMore": true
  }
  ```
- The 50 events are the second page of results (offset 50), sorted by startedAt DESC

## Notes
Verifies FR-8 (pagination), FR-9 (pagination object shape), FR-10 (total reflects all matching rows, not just current page).
