# Scenario: H-12 — endedAt before startedAt returns 400

## Type
edge-case

## Priority
high — physically impossible interval; would produce negative durations in analytics (BR-4)

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h12"`, `id = "install-h12"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h12
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "endedAt":   "2026-04-06T09:59:59.000Z"
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "endedAt must be >= startedAt" }`
- No row inserted
