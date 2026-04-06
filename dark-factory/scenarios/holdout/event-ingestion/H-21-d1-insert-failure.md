# Scenario: H-21 — D1 insert failure returns 500 without leaking raw error

## Type
failure-recovery

## Priority
high — verifies FR-15; raw D1 errors must not be surfaced to callers

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h21"`, `id = "install-h21"`,
  `orgId = "org-xyz"`
- The test harness is configured to simulate a D1 failure on the INSERT to `events`
  (e.g., by using a mock/stub that throws `new Error("D1_ERROR: SQLITE_CONSTRAINT ...")`)

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h21
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z"
}
```

## Expected Outcome
- HTTP 500
- Response body: `{ "error": "Internal server error" }` (exact string)
- Response body does NOT contain: "D1_ERROR", "SQLITE", "sqlite", any stack trace,
  any table or column names from the schema

## Failure Mode
If the catch block is missing or re-throws, the runtime produces an unhandled 500 that
may leak the raw D1 error message. This scenario verifies the explicit catch + sanitized response.

## Notes
In a Cloudflare Workers / D1 environment, D1 errors are thrown as exceptions from the
`db.insert()` call. The route must wrap this in try/catch and respond with a generic
500 message.
