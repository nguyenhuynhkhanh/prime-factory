# Scenario P-04: requireApiKey rejects revoked key with 403

**Spec**: api-key-management-server
**Requirement**: FR-1, BR-5, FR-3
**Track**: A (auth-dependent routes)

---

## Setup

- Install `install-333` exists: `api_key = 'deadbeef...'` (64-char hex),
  `revoked_at = <unix-seconds, not null>` (previously revoked),
  `expires_at > now` (key is not expired — ensures the revocation check fires, not expiry).

---

## Steps

1. Send `POST /api/v1/events` (any Bearer-authed endpoint) with:
   - Header: `Authorization: Bearer deadbeef...`
   - Body: a valid event payload (e.g. `{ "command": "df-intake", "startedAt": "<iso>" }`)

---

## Expected

- HTTP 403
- Response body: `{ "error": "api key revoked" }`
- The request is rejected by `requireApiKey` before the route handler body executes.
- No DB write occurs (no event row is inserted).

---

## requireApiKey check-order assertion

- `revokedAt IS NOT NULL` is checked **before** `expiresAt < now`.
- A key that is both revoked AND expired returns 403 (not 401) — revocation takes precedence.

---

## API_KEY_SALT guard removal assertion

- With `API_KEY_SALT` absent or shorter than 16 chars in the environment:
  - The request with a valid, non-revoked, non-expired key returns **200** (not 500).
  - `requireApiKey` must not check `API_KEY_SALT` at all (FR-3).
