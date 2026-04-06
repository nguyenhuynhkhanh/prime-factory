# Scenario: P-01 — Minimal valid event is ingested and row is persisted

## Type
feature

## Priority
critical — this is the single core happy path for the entire CLI telemetry pipeline

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-001"`, `id = "install-aaa"`,
  `orgId = "org-xyz"`
- `events` table is empty

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-001
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z"
}
```

## Expected Outcome
- HTTP 201
- Response body: `{ "ok": true, "id": "<uuid>" }` where `<uuid>` matches a UUID v4 pattern
- D1 `events` table contains exactly 1 row with:
  - `id` = the UUID from the response body
  - `install_id` = `"install-aaa"`
  - `org_id` = `"org-xyz"`
  - `command` = `"df-intake"`
  - `started_at` = Unix timestamp for `2026-04-06T10:00:00.000Z` (1744185600)
  - `created_at` = a Unix timestamp <= current server time and > (server time - 5 seconds)
  - all optional fields (`subcommand`, `ended_at`, `duration_ms`, `outcome`, `feature_name`,
    `round_count`, `prompt_text`, `session_id`) = NULL

## Notes
This verifies FR-13 (timestamps stored as Unix seconds), FR-14 (201 response shape),
and FR-12 (server-generated id and createdAt).
