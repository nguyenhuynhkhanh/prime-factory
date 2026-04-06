# Scenario: P-04 — Duplicate events create separate rows (no deduplication at MVP)

## Type
feature

## Priority
medium — verifies BR-6; establishes expected behavior for CLI fire-and-forget retries

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-004"`, `id = "install-ddd"`,
  `orgId = "org-xyz"`
- `events` table has 0 rows for `install-ddd`

## Action
Send the identical request twice in sequence:

```
POST /api/v1/events
Authorization: Bearer test-key-004
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "sessionId": "sess-dup-001"
}
```

(Same request body both times.)

## Expected Outcome
- Both requests return HTTP 201
- Each response contains a different `id` UUID
- D1 `events` table contains 2 rows for `install-ddd`, each with a unique `id`,
  both with `session_id = "sess-dup-001"`

## Notes
This is intentional behavior. The dashboard may eventually deduplicate on `sessionId`
for display purposes, but the ingest layer does not enforce uniqueness.
