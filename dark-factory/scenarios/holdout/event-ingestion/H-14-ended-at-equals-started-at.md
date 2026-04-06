# Scenario: H-14 — endedAt exactly equal to startedAt is accepted (zero-duration event)

## Type
edge-case

## Priority
medium — verifies EC-2; boundary value for the endedAt >= startedAt rule

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h14"`, `id = "install-h14"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h14
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "endedAt":   "2026-04-06T10:00:00.000Z"
}
```

## Expected Outcome
- HTTP 201
- D1 row: `started_at` = `ended_at` = Unix timestamp for 2026-04-06T10:00:00Z
