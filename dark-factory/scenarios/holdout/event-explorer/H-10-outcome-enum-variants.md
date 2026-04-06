# Scenario: H-10 — Each outcome enum variant is individually filterable; invalid values return 400

## Type
edge-case

## Priority
medium — parameter variant coverage for outcome

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 1 event per outcome type seeded within last 7 days:
  - `outcome=success`, `outcome=failed`, `outcome=blocked`, `outcome=abandoned`

## Action — Part A: Valid enum variants (4 requests)
```
GET /api/v1/dashboard/events?outcome=success
GET /api/v1/dashboard/events?outcome=failed
GET /api/v1/dashboard/events?outcome=blocked
GET /api/v1/dashboard/events?outcome=abandoned
```

## Action — Part B: Invalid values (3 requests)
```
GET /api/v1/dashboard/events?outcome=error
GET /api/v1/dashboard/events?outcome=SUCCESS
GET /api/v1/dashboard/events?outcome=null
```

## Expected Outcome — Part A
- Each returns 200 with exactly 1 matching event
- `pagination.total` is 1 for each

## Expected Outcome — Part B
- Each returns 400 with `{ "error": "Invalid outcome value" }`
- Note: `outcome=null` as a string is invalid — null outcome rows are returned when no `outcome` filter is applied, not by passing the string "null"

## Notes
Verifies FR-5, EC-8. The string "null" is not a valid enum value. Events with `outcome = null` in the database are accessible without any outcome filter applied.
