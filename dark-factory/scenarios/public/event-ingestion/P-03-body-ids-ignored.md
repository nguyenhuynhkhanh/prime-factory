# Scenario: P-03 — Body-supplied installId and orgId are ignored; key-resolved values are used

## Type
feature

## Priority
critical — this is a security invariant (BR-1); wrong behavior would allow event spoofing

## Preconditions
- D1 contains:
  - `installs` row: `apiKey = "test-key-003"`, `id = "install-ccc"`, `orgId = "org-real"`
  - No install with `id = "install-fake"` or `orgId = "org-fake"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-003
Content-Type: application/json

{
  "command": "df-debug",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "installId": "install-fake",
  "orgId": "org-fake",
  "id": "00000000-0000-0000-0000-000000000001",
  "createdAt": "2020-01-01T00:00:00.000Z"
}
```

## Expected Outcome
- HTTP 201
- D1 row has:
  - `install_id` = `"install-ccc"` (from key, not body)
  - `org_id` = `"org-real"` (from key, not body)
  - `id` != `"00000000-0000-0000-0000-000000000001"` (server-generated UUID)
  - `created_at` reflects current server time, not `2020-01-01`

## Notes
Verifies FR-2 and EC-7 and EC-8. This scenario must be run by the code-agent
as part of its security verification, not just by holdout.
