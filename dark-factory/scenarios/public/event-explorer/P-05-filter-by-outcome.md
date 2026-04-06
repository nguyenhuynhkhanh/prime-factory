# Scenario: P-05 — Filter by outcome returns only matching outcome events

## Type
feature

## Priority
high — outcome filter is essential for failure investigation ("show me everything that failed")

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Events seeded (all within last 7 days):
  - 5 events with `outcome=failed`
  - 3 events with `outcome=success`
  - 2 events with `outcome=blocked`
  - 1 event with `outcome=abandoned`

## Action
```
GET /api/v1/dashboard/events?outcome=failed
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains exactly 5 items, all with `outcome=failed`
- Events with other outcomes do not appear
- `pagination.total` is 5

## Notes
Verifies FR-2 (outcome filter), FR-5 (valid enum value passes through without error). The full enum is: success, failed, blocked, abandoned.
