# Scenario P-01: POST /installs generates API key

**Spec**: api-key-management-server
**Requirement**: FR-4, FR-5, FR-6, FR-7, NFR-2
**Track**: B (admin routes)

---

## Setup

- A CTO session cookie exists for org `org-abc`.
- No install with label `"dev-laptop"` exists for `org-abc`.

---

## Steps

1. Send `POST /api/v1/installs` with:
   - Cookie: valid `__Host-session` for org `org-abc`
   - Body: `{ "label": "dev-laptop" }`

---

## Expected

- HTTP 201
- Response body:
  ```json
  {
    "id": "<uuid>",
    "apiKey": "<64-char hex string>",
    "label": "dev-laptop",
    "expiresAt": <unix-seconds integer, approximately now + 30d>
  }
  ```
- `apiKey` is exactly 64 hex characters (32 bytes, hex-encoded).
- `id` is a valid UUID v4 format.
- `expiresAt` is within ±60 seconds of `Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60`.
- A row exists in the `installs` table with `org_id = 'org-abc'`, `label = 'dev-laptop'`, `revoked_at = NULL`, `computer_name = NULL`, `git_user_id = NULL`.
- The `api_key` column in the DB matches the returned `apiKey`.

---

## Negative assertions

- The response body does NOT contain `hmac`, `computerName`, `gitUserId`, or `revokedAt`.
- A subsequent `GET /api/v1/dashboard/installs` does NOT return `apiKey` for this install.

---

## Validation sub-cases

| Body | Expected status | Expected error |
|------|-----------------|----------------|
| `{}` (no label) | 400 | `{ "error": "missing required fields" }` |
| `{ "label": "" }` | 400 | `{ "error": "missing required fields" }` |
| `{ "label": "   " }` (whitespace only) | 400 | `{ "error": "missing required fields" }` |
| `{ "label": "x".repeat(65) }` (65 chars) | 400 | `{ "error": "label too long" }` |
| `{ "label": "x".repeat(64) }` (64 chars) | 201 | — (boundary accepted) |
| No session cookie | 401 | (from requireCtoSession) |
