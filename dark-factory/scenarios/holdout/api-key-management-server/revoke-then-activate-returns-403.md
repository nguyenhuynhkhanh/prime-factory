# Scenario H-02: Revoke-then-activate returns 403

**Spec**: api-key-management-server
**Requirement**: FR-1, FR-10, BR-5
**Track**: A (auth-dependent routes)
**Classification**: HOLDOUT — do not include in public training data

---

## Setup

- Install `install-666` exists:
  - `api_key = 'f00dface...'` (64-char hex)
  - `revoked_at = NULL`
  - `expires_at > now`
  - `computer_name = NULL` (not yet activated)

---

## Steps

1. **Revoke the install** (admin action):

   ```
   PATCH /api/v1/installs/install-666/revoke
   Cookie: valid __Host-session for the install's org
   ```

   Expect: HTTP 200 `{ "ok": true }`

2. **Attempt to activate using the now-revoked key**:

   ```
   POST /api/v1/installs/activate
   Authorization: Bearer f00dface...
   Body: { "computerName": "dev-machine", "gitUserId": "bob@example.com" }
   ```

---

## Expected (Step 2)

- HTTP 403
- Response body: `{ "error": "api key revoked" }`
- The `installs` row for `install-666` remains unmodified:
  - `computer_name` is still NULL
  - `git_user_id` is still NULL
  - `last_seen_at` is unchanged
  - `expires_at` is unchanged (the fire-and-forget update in `requireApiKey` must NOT fire for revoked keys)

---

## Ordering assertion

`requireApiKey` checks revocation before expiry (FR-1). The middleware rejects the request at the revocation check — the activate handler body never executes.

---

## Note

This scenario validates that revoking a key immediately prevents all further CLI operations — even if the developer already has the key and hasn't activated it yet. It is the core security guarantee of the revocation feature.
