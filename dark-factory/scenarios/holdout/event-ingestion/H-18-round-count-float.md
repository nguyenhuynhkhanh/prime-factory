# Scenario: H-18 — roundCount as float (non-integer) returns 400

## Type
edge-case

## Priority
medium — verifies EC-10; roundCount is defined as integer >= 0; 1.5 is not an integer

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h18"`, `id = "install-h18"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h18
Content-Type: application/json

{
  "command": "df-orchestrate",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "roundCount": 1.5
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid roundCount" }`
- No row inserted

## Notes
The implementation must use `Number.isInteger(roundCount)` (or equivalent), not just
`roundCount >= 0`. A check of `typeof roundCount === "number" && roundCount >= 0`
would pass `1.5` incorrectly.
