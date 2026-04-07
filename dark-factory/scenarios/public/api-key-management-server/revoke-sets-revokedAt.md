# Scenario P-02: PATCH /installs/[id]/revoke sets revokedAt

**Spec**: api-key-management-server
**Requirement**: FR-8, FR-9, BR-5
**Track**: A (auth-dependent routes)

---

## Setup

- A CTO session cookie exists for org `org-abc`.
- Install `install-111` exists: `org_id = 'org-abc'`, `revoked_at = NULL`.

---

## Steps

1. Send `PATCH /api/v1/installs/install-111/revoke` with:
   - Cookie: valid `__Host-session` for org `org-abc`
   - No request body required

---

## Expected

- HTTP 200
- Response body: `{ "ok": true }`
- The `installs` row for `install-111` now has `revoked_at` set to approximately the current Unix timestamp (within ±60 seconds).
- `revoked_at` was previously NULL; it is now an integer.

---

## Post-condition check

- A subsequent `PATCH /api/v1/installs/install-111/revoke` (called a second time) returns:
  - HTTP 200
  - Response body: `{ "ok": true }`
  - `revoked_at` is unchanged (idempotent — FR-9)

---

## Failure sub-cases

| Scenario | Expected status | Expected error |
|----------|-----------------|----------------|
| No session cookie | 401 | (from requireCtoSession) |
| `id` belongs to a different org (`org-xyz`) | 404 | `{ "error": "not found" }` |
| `id` does not exist at all | 404 | `{ "error": "not found" }` |
