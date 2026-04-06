# Scenario: P-06 — Filter by from only (no to) applies lower bound with no upper bound

## Type
feature

## Priority
high — date range filtering is core navigation

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Events seeded:
  - Event BEFORE: `startedAt = 2026-03-31T23:59:59Z`
  - Event AT: `startedAt = 2026-04-01T00:00:00Z`
  - Event AFTER-1: `startedAt = 2026-04-03T12:00:00Z`
  - Event AFTER-2: `startedAt = 2026-04-06T08:00:00Z` (today)

## Action
```
GET /api/v1/dashboard/events?from=2026-04-01T00:00:00.000Z
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains 3 items: AT, AFTER-1, AFTER-2
- Event BEFORE is excluded
- No upper bound is applied — AFTER-2 (today) is included
- `pagination.total` is 3

## Notes
Verifies EC-10 (from without to). The `from` param overrides the default 7-day server default. When `from` is explicitly provided, the server uses it directly and does not apply a default.
