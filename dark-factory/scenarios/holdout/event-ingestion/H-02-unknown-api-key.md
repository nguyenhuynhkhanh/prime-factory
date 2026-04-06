# Scenario: H-02 — Unknown API key returns 401

## Type
edge-case

## Priority
critical — stale or revoked keys must not produce events

## Preconditions
- No `installs` row exists for `apiKey = "nonexistent-key-999"`

## Action
```
POST /api/v1/events
Authorization: Bearer nonexistent-key-999
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z"
}
```

## Expected Outcome
- HTTP 401
- Response body: `{ "error": "<non-empty string>" }`
- No row inserted into `events`

## Failure Mode
If the route accidentally skips the auth check and proceeds to insert, the test fails:
the events table must remain empty.
