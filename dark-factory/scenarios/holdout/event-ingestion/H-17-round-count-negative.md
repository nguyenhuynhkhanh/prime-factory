# Scenario: H-17 — roundCount negative returns 400

## Type
edge-case

## Priority
high — verifies FR-9; negative round count is nonsensical data

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h17"`, `id = "install-h17"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h17
Content-Type: application/json

{
  "command": "df-orchestrate",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "roundCount": -1
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid roundCount" }`
- No row inserted
