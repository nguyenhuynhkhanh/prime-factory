# Scenario: P-06 — durationMs of zero is accepted

## Type
feature

## Priority
medium — verifies EC-3; zero-duration events are valid (e.g. a command that errors immediately)

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-006"`, `id = "install-fff"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-006
Content-Type: application/json

{
  "command": "df-cleanup",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "durationMs": 0
}
```

## Expected Outcome
- HTTP 201
- D1 row `duration_ms` = 0
