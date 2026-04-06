# Scenario: H-01 — Missing Authorization header returns 401

## Type
edge-case

## Priority
critical — unauthenticated ingest must be rejected before body parsing

## Preconditions
- No special D1 state required

## Action
```
POST /api/v1/events
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z"
}
```
(No `Authorization` header)

## Expected Outcome
- HTTP 401
- Response body: `{ "error": "<non-empty string>" }`
- No row inserted into `events` table
- Body was NOT parsed / validated (auth runs first per FR-1)

## Notes
The exact error message is owned by `requireApiKey`; this scenario only
verifies the HTTP status and that no data leaks through.
