# Scenario P-05: requireApiKey rejects expired key with 401

**Spec**: api-key-management-server
**Requirement**: FR-1, BR-5
**Track**: A (auth-dependent routes)

---

## Setup

- Install `install-444` exists: `api_key = 'c0ffee...'` (64-char hex),
  `revoked_at = NULL` (not revoked),
  `expires_at = <unix-seconds in the past>` (key is expired — e.g. `now - 1`).

---

## Steps

1. Send `POST /api/v1/events` (any Bearer-authed endpoint) with:
   - Header: `Authorization: Bearer c0ffee...`
   - Body: a valid event payload

---

## Expected

- HTTP 401
- Response body: `{ "error": "api key expired" }`
- The request is rejected by `requireApiKey` before the route handler body executes.
- No DB write occurs (no event row is inserted).

---

## Boundary check

| `expires_at` value | Expected result |
|-------------------|-----------------|
| `now - 1` (one second ago) | 401 `api key expired` |
| `now + 1` (one second from now) | Passes auth (200 or appropriate route response) |
| Exactly `now` (same second) | 401 `api key expired` — condition is `expiresAt < now`, so equal-to-now is expired |

---

## Contrast with revoked

- A revoked key returns **403** (scenario P-04).
- An expired (non-revoked) key returns **401** (this scenario).
- The distinction matters for the CLI: 403 means "get a new key from your admin"; 401 on expiry means "key needs renewal" (but the sliding window should prevent this in normal use).
