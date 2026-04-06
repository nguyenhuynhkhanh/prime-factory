# Scenario: H-15 — durationMs negative returns 400

## Type
edge-case

## Priority
high — verifies FR-8; negative duration is nonsensical data

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h15"`, `id = "install-h15"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h15
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "durationMs": -1
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid durationMs" }`
- No row inserted
