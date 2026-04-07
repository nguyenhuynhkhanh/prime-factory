# Scenario P-03: POST /installs/activate populates machine info

**Spec**: api-key-management-server
**Requirement**: FR-10, FR-11, BR-9
**Track**: A (auth-dependent routes)

---

## Setup

- Install `install-222` exists: `api_key = 'aabbcc...dd'` (64-char hex), `revoked_at = NULL`,
  `expires_at > now`, `computer_name = NULL`, `git_user_id = NULL`.

---

## Steps

1. Send `POST /api/v1/installs/activate` with:
   - Header: `Authorization: Bearer aabbcc...dd`
   - Body:
     ```json
     {
       "computerName": "macbook-pro-alice",
       "gitUserId": "alice@example.com"
     }
     ```

---

## Expected

- HTTP 200
- Response body: `{ "ok": true }`
- The `installs` row for `install-222` has been updated:
  - `computer_name = 'macbook-pro-alice'`
  - `git_user_id = 'alice@example.com'`
  - `expires_at` is approximately `Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60` (within ±60 seconds)
  - `last_seen_at` is approximately the current Unix timestamp (within ±60 seconds)
- All four fields (`computer_name`, `git_user_id`, `expires_at`, `last_seen_at`) were updated in a single DB UPDATE (not separate calls).

---

## Validation sub-cases

| Body | Expected status | Expected error |
|------|-----------------|----------------|
| `{}` (both fields missing) | 400 | `{ "error": "missing required fields" }` |
| `{ "computerName": "x" }` (gitUserId missing) | 400 | `{ "error": "missing required fields" }` |
| `{ "computerName": "", "gitUserId": "alice" }` | 400 | `{ "error": "missing required fields" }` |
| `{ "computerName": "x".repeat(256), "gitUserId": "y" }` | 400 | `{ "error": "computerName too long" }` |
| `{ "computerName": "x", "gitUserId": "y".repeat(256) }` | 400 | `{ "error": "gitUserId too long" }` |
| `{ "computerName": "x".repeat(255), "gitUserId": "y".repeat(255) }` | 200 | — (boundary accepted) |
| No Authorization header | 401 | (from requireApiKey) |
