# Scenario P-06: Sliding expiry extends on every valid request

**Spec**: api-key-management-server
**Requirement**: FR-2, BR-4, EC-7
**Track**: A (auth-dependent routes)

---

## Setup

- Install `install-555` exists: `api_key = 'a1b2c3...'`,
  `revoked_at = NULL`,
  `expires_at = T0` (a Unix timestamp ~15 days from now — half-expired),
  `last_seen_at = <some past value>`.
- Record `T_before = Math.floor(Date.now() / 1000)`.

---

## Steps

1. Send `POST /api/v1/events` (any Bearer-authed endpoint) with:
   - Header: `Authorization: Bearer a1b2c3...`
   - Body: valid event payload

---

## Expected

- HTTP 201 (request succeeds — the route handler runs normally)
- The `installs` row for `install-555` is updated (fire-and-forget, within a short window after the response):
  - `expires_at ≈ T_before + 30 * 24 * 60 * 60` (within ±60 seconds)
  - `last_seen_at ≈ T_before` (within ±60 seconds)
- The new `expires_at` is strictly greater than the old `T0` (expiry was extended, not reset to original).

---

## Fire-and-forget behavior

- The update of `lastSeenAt` and `expiresAt` must NOT block or delay the HTTP response.
- If the `UPDATE` fails (simulated by a transient D1 error):
  - The HTTP response is still 201 (the event is still recorded).
  - The error is swallowed silently.
  - `expires_at` may not be updated in this case — this is documented and acceptable (EC-7).

---

## Single UPDATE assertion

- `lastSeenAt` and `expiresAt` must be written in a single `UPDATE installs SET last_seen_at = ?, expires_at = ? WHERE id = ?` call.
- This is not verified by integration test but should be verifiable by code review / unit test with a spy on the DB client.

---

## Interaction with activate

- `POST /api/v1/installs/activate` also updates `lastSeenAt` and `expiresAt` directly in its own handler (FR-11). The `requireApiKey` fire-and-forget fires first (from the middleware), and the activate handler's explicit UPDATE fires after. Both write the same values. This is acceptable duplication — the net result is correct.
