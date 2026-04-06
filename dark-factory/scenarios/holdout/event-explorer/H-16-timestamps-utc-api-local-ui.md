# Scenario: H-16 — API returns ISO 8601 UTC timestamps; UI renders in browser local timezone

## Type
edge-case

## Priority
medium — timezone handling is a common silent bug in dashboard UIs

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 1 event with `startedAt = 2026-04-05T22:00:00Z` (10:00 PM UTC)
- The browser is set to UTC+8 (Asia/Singapore), meaning this is 2026-04-06T06:00:00+08:00

## Action — API check
```
GET /api/v1/dashboard/events
Cookie: session=<valid-cto-session>
```

## Action — UI check
User views the Event Explorer page in a browser with timezone UTC+8

## Expected Outcome — API
- `startedAt` in the response is `"2026-04-05T22:00:00.000Z"` (ISO 8601 UTC)
- Not `"2026-04-06T06:00:00+08:00"` or any other timezone-offset format
- Not a Unix timestamp integer

## Expected Outcome — UI
- The `startedAt` column in the table displays the time in the browser's local timezone: "Apr 6, 2026, 6:00 AM" (or equivalent locale format)
- The raw UTC string from the API is converted client-side (e.g., via `new Date(startedAt).toLocaleString()`)

## Notes
Verifies FR-18. The D1 integer timestamps (seconds since epoch) are converted to ISO 8601 UTC strings before being placed in the JSON response. The UI layer handles local display — the API never sends timezone-local timestamps.
