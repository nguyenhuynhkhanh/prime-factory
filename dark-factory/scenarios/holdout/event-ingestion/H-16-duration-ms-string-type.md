# Scenario: H-16 — durationMs sent as string returns 400

## Type
edge-case

## Priority
medium — verifies EC-11; type coercion must not convert string "45000" to a valid number

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h16"`, `id = "install-h16"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h16
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "durationMs": "45000"
}
```
(Note: `durationMs` value is a JSON string, not a number)

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid durationMs" }`
- No row inserted

## Notes
A validation that only checks `durationMs >= 0` without first checking `typeof durationMs === "number"`
would pass `"45000"` because `"45000" >= 0` is `true` in JavaScript. This scenario
catches that implementation gap.
