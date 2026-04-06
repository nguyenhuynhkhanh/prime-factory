# Scenario: H-19 — outcome not in enum returns 400

## Type
edge-case

## Priority
high — verifies FR-10; unknown outcome values corrupt dashboard charts

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h19"`, `id = "install-h19"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h19
Content-Type: application/json

{
  "command": "df-debug",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "outcome": "partial"
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid outcome" }`
- No row inserted
