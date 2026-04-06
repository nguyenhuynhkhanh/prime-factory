# Scenario: H-03 — Malformed JSON body returns 400

## Type
edge-case

## Priority
high — CLI sends raw JSON; a malformed body must not cause a 500 or unhandled exception

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h03"`, `id = "install-h03"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h03
Content-Type: application/json

{ "command": "df-intake", "startedAt":
```
(Body is incomplete / invalid JSON)

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid JSON" }`
- No row inserted into `events`

## Notes
The route must use try/catch around `request.json()`. An unhandled rejection
would cause a 500 — this scenario distinguishes correct error handling from
a missing catch.
