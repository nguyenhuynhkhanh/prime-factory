# Scenario: H-10 — startedAt more than 1 hour in the future returns 400

## Type
edge-case

## Priority
high — protects time-series charts from corrupt far-future data (BR-3)

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h10"`, `id = "install-h10"`,
  `orgId = "org-xyz"`
- Server time is approximately 2026-04-06T10:00:00.000Z (test should compute
  "now + 1 hour + 1 second" dynamically based on actual server time)

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h10
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "<ISO string for server_now + 3601 seconds>"
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "startedAt is too far in the future" }`
- No row inserted

## Notes
This verifies EC-13. The boundary is strictly > 1 hour. 3601 seconds in the future
is clearly over the limit.
