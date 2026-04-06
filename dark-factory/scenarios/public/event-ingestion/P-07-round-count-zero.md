# Scenario: P-07 — roundCount of zero is accepted

## Type
feature

## Priority
medium — verifies EC-4; zero-round events are valid (e.g. a command that was abandoned before any rounds)

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-007"`, `id = "install-ggg"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-007
Content-Type: application/json

{
  "command": "df-debug",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "outcome": "abandoned",
  "roundCount": 0
}
```

## Expected Outcome
- HTTP 201
- D1 row `round_count` = 0
- D1 row `outcome` = `"abandoned"`
