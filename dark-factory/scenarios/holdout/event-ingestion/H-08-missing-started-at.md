# Scenario: H-08 — Missing startedAt returns 400

## Type
edge-case

## Priority
high — required field; every event must be anchored to a start time

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h08"`, `id = "install-h08"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h08
Content-Type: application/json

{
  "command": "df-intake"
}
```
(No `startedAt` field)

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid startedAt" }`
- No row inserted
