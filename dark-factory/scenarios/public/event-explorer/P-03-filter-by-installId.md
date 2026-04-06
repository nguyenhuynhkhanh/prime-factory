# Scenario: P-03 — Filter by installId returns only events from that install

## Type
feature

## Priority
high — installId filter is a primary investigation tool ("show me only Alice's events")

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Two installs both belonging to org-acme:
  - `install-alice` (gitUserId=alice, computerName=alice-macbook)
  - `install-bob` (gitUserId=bob, computerName=bob-laptop)
- Events seeded (all within last 7 days):
  - 3 events with `installId=install-alice`
  - 2 events with `installId=install-bob`

## Action
```
GET /api/v1/dashboard/events?installId=install-alice
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains exactly 3 items, all with `installId=install-alice`
- No events with `installId=install-bob` appear
- `pagination.total` is 3

## Notes
Verifies FR-2 (installId filter), FR-7 (same-org install). This is the investigative path: "show me everything Alice ran."
