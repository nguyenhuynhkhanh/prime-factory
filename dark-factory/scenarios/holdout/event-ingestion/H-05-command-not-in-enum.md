# Scenario: H-05 — command not in enum returns 400

## Type
edge-case

## Priority
high — prevents dashboard noise from unknown command names (BR-2)

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h05"`, `id = "install-h05"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h05
Content-Type: application/json

{
  "command": "df-unknown",
  "startedAt": "2026-04-06T10:00:00.000Z"
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid command" }`
- No row inserted
