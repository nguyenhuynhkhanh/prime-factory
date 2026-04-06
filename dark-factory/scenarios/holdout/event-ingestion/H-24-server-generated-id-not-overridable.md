# Scenario: H-24 — Server-supplied id and createdAt from body are ignored

## Type
edge-case

## Priority
medium — verifies EC-8; callers must not be able to set primary key or audit timestamp

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h24"`, `id = "install-h24"`,
  `orgId = "org-xyz"`
- No row exists in `events` with `id = "00000000-dead-beef-0000-000000000000"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h24
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "id": "00000000-dead-beef-0000-000000000000",
  "createdAt": "2020-01-01T00:00:00.000Z"
}
```

## Expected Outcome
- HTTP 201
- Response `id` != `"00000000-dead-beef-0000-000000000000"`
- D1 has no row with `id = "00000000-dead-beef-0000-000000000000"`
- D1 row `created_at` is a Unix timestamp for approximately 2026-04-06 (current server time),
  not for 2020-01-01

## Notes
If the implementation spreads the parsed body directly into the Drizzle insert values
(e.g., `db.insert(events).values({ ...body, installId, orgId })`), this scenario would
fail because the body-supplied `id` and `createdAt` would override the server-generated ones.
