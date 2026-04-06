# Scenario: P-04 — Filter by command returns only matching command events

## Type
feature

## Priority
high — command filter is core to investigation ("show me all orchestrate runs")

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Events seeded (all within last 7 days):
  - 4 events with `command=df-orchestrate`
  - 3 events with `command=df-debug`
  - 2 events with `command=df-intake`

## Action
```
GET /api/v1/dashboard/events?command=df-orchestrate
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains exactly 4 items, all with `command=df-orchestrate`
- Events with other commands do not appear
- `pagination.total` is 4

## Notes
Verifies FR-2 (command filter), FR-4 (valid enum value passes through without error).
