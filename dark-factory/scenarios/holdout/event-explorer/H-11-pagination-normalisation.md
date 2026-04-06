# Scenario: H-11 — page=0, page=-1, limit=0 are normalised not rejected

## Type
edge-case

## Priority
high — pagination edge values must not throw errors that break programmatic callers

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 3 events exist within last 7 days

## Action (3 separate requests)
```
GET /api/v1/dashboard/events?page=0
GET /api/v1/dashboard/events?page=-5
GET /api/v1/dashboard/events?limit=0
```

## Expected Outcome — page=0
- Status: 200
- `pagination.page` is 1 (normalised)
- Returns first page of results

## Expected Outcome — page=-5
- Status: 200
- `pagination.page` is 1 (normalised)
- Returns first page of results

## Expected Outcome — limit=0
- Status: 200
- `pagination.limit` is 1 (normalised to minimum of 1)
- `events` array contains exactly 1 item
- `pagination.total` is 3

## Notes
Verifies FR-8, BR-4, EC-4. These are sanitised inputs, not validation errors. The spec explicitly states they are treated as page=1 / limit=1 respectively.
