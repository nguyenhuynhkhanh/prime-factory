# Scenario H-03: Activate idempotent — second call succeeds and overwrites

**Spec**: api-key-management-server
**Requirement**: FR-11, BR-7
**Track**: A (auth-dependent routes)
**Classification**: HOLDOUT — do not include in public training data

---

## Setup

- Install `install-777` exists:
  - `api_key = 'abcdef01...'` (64-char hex)
  - `revoked_at = NULL`
  - `expires_at > now`
  - `computer_name = 'macbook-alice'`
  - `git_user_id = 'alice@example.com'`
  - (already activated from a prior call)

---

## First call (already done — part of setup)

The install was previously activated with `computerName = 'macbook-alice'` and `gitUserId = 'alice@example.com'`.

---

## Second call (the actual test step)

Send `POST /api/v1/installs/activate` with:
- Header: `Authorization: Bearer abcdef01...`
- Body:
  ```json
  {
    "computerName": "new-macbook-alice",
    "gitUserId": "alice-new@example.com"
  }
  ```

---

## Expected

- HTTP 200
- Response body: `{ "ok": true }`
- The `installs` row for `install-777` has been overwritten:
  - `computer_name = 'new-macbook-alice'`
  - `git_user_id = 'alice-new@example.com'`
  - `expires_at ≈ now + 30d` (extended again)
  - `last_seen_at ≈ now`

---

## Same-values idempotency sub-case

Send `POST /api/v1/installs/activate` a third time with the same body as the second call:
- HTTP 200
- `{ "ok": true }`
- Values are unchanged (overwriting with the same value is a no-op in effect).

---

## Design note

There is no "already activated" guard — the handler unconditionally overwrites. This supports legitimate re-activation scenarios:

- Developer gets a new laptop and re-runs `df-onboard` with an existing key
- Developer changes their Git identity
- Testing/automation environments that share a key across machines (discouraged but not prevented)
