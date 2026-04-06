# Scenario: H-18 — from and to are the same instant (not a 400)

## Type
edge-case

## Priority
low — boundary: identical from/to should work, not return an error

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 1 event with `startedAt = 2026-04-05T10:00:00Z`
- 1 event with `startedAt = 2026-04-05T09:59:59Z` (1 second before)
- 1 event with `startedAt = 2026-04-05T10:00:01Z` (1 second after)

## Action
```
GET /api/v1/dashboard/events?from=2026-04-05T10:00:00.000Z&to=2026-04-05T10:00:00.000Z
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200 (not 400 — `from == to` is valid)
- `events` array contains exactly 1 item: the event with `startedAt = 2026-04-05T10:00:00Z`
- The events 1 second before and after are excluded
- `pagination.total` is 1

## Notes
Verifies EC-3. The spec states `from > to` is a 400, but `from == to` is valid. This is a point-in-time query. The boundary condition test confirms the implementation uses `>=` and `<=` (inclusive) not `>` and `<`.
