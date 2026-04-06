# Scenario: H-08 — to provided without from applies default from plus upper bound

## Type
edge-case

## Priority
high — "to without from" is an easy implementation mistake (skip default-from logic)

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Request time is approximately 2026-04-06T12:00:00Z (so default `from` = 2026-03-30T12:00:00Z)
- Events seeded:
  - Event VERY-OLD: `startedAt = 2026-03-01T00:00:00Z` — outside default 7d window
  - Event IN-WINDOW: `startedAt = 2026-04-02T10:00:00Z` — inside 7d window AND before `to`
  - Event AFTER-TO: `startedAt = 2026-04-06T11:00:00Z` — inside 7d window but after `to`

## Action
```
GET /api/v1/dashboard/events?to=2026-04-05T23:59:59.000Z
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains exactly 1 item: Event IN-WINDOW
- Event VERY-OLD excluded (before default `from` of now-7d)
- Event AFTER-TO excluded (after `to`)
- `pagination.total` is 1

## Notes
Verifies EC-11, FR-3. The server must apply the default `from = now - 7 days` even when only `to` is supplied. A common implementation mistake is to only apply `to` as a filter and skip the default-from logic when `from` is absent.
