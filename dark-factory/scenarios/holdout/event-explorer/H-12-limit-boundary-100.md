# Scenario: H-12 — limit=100 is not capped (boundary value); limit=101 is capped to 100

## Type
edge-case

## Priority
medium — boundary value for the limit cap (EC-5)

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 150 events exist within last 7 days

## Action
```
GET /api/v1/dashboard/events?limit=100
GET /api/v1/dashboard/events?limit=101
```

## Expected Outcome — limit=100
- Status: 200
- `events` array contains exactly 100 items
- `pagination.limit` is 100 (no cap triggered; 100 is the maximum allowed value)
- `pagination.hasMore` is true (150 total, 100 returned)

## Expected Outcome — limit=101
- Status: 200
- `events` array contains exactly 100 items (capped)
- `pagination.limit` is 100
- Behaviour identical to limit=100

## Notes
Verifies FR-8, BR-3, EC-5. limit=100 must not be double-capped or treated as "over limit." limit=101 is the first value that triggers the cap.
