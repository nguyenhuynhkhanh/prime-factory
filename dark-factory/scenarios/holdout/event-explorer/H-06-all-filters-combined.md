# Scenario: H-06 — All five filters combined produce correct AND-filtered results

## Type
edge-case

## Priority
high — multiple simultaneous filters is the primary power-user investigation path

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Install `install-alice` (gitUserId=alice) belongs to org-acme
- Events seeded (all within last 7 days unless noted):
  - Row 1: `installId=install-alice`, `command=df-orchestrate`, `outcome=failed`, `startedAt=2026-04-04T10:00:00Z` — MATCHES ALL
  - Row 2: `installId=install-alice`, `command=df-orchestrate`, `outcome=success`, `startedAt=2026-04-04T11:00:00Z` — wrong outcome
  - Row 3: `installId=install-alice`, `command=df-debug`, `outcome=failed`, `startedAt=2026-04-04T09:00:00Z` — wrong command
  - Row 4: `installId=install-bob`, `command=df-orchestrate`, `outcome=failed`, `startedAt=2026-04-04T10:30:00Z` — wrong install
  - Row 5: `installId=install-alice`, `command=df-orchestrate`, `outcome=failed`, `startedAt=2026-03-25T10:00:00Z` — outside date range

## Action
```
GET /api/v1/dashboard/events?installId=install-alice&command=df-orchestrate&outcome=failed&from=2026-04-01T00:00:00.000Z&to=2026-04-05T23:59:59.000Z
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains exactly 1 item: Row 1
- `pagination.total` is 1
- Each filter condition is applied as AND; no partial-match rows appear

## Notes
Verifies FR-2 (all filters combined), EC-15. This is the "drill-down" scenario: CTO is asking "show me all of Alice's failed orchestrate runs this week."
