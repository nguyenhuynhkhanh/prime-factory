# Scenario: P-02 — Default 7-day window applied when no from param is provided

## Type
feature

## Priority
critical — default date window is the primary protection against full-table scans

## Preconditions
- CTO authenticated with valid session cookie; `orgId = "org-acme"`
- 5 events exist for org-acme:
  - Event OLD: `startedAt = 2026-03-01T00:00:00Z` (older than 7 days relative to 2026-04-06)
  - Events RECENT-1 through RECENT-4: `startedAt` values within the last 7 days (2026-03-30 through 2026-04-05)
- No `from` param provided
- No `to` param provided

## Action
```
GET /api/v1/dashboard/events
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- Response `events` array contains exactly 4 items (RECENT-1 through RECENT-4)
- Event OLD is NOT in the response
- `pagination.total` is 4
- The server applied `started_at >= (request_time - 7 days)` without the client specifying `from`

## Notes
Verifies FR-3, BR-2. The exact cutoff is `now - 7 days` on the server clock at request time. The scenario seeds data clearly outside vs. inside the window to make the boundary unambiguous.
