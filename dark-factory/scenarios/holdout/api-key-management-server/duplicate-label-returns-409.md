# Scenario H-01: Duplicate label returns 409

**Spec**: api-key-management-server
**Requirement**: FR-6, BR-2, EC-3, EC-5
**Track**: B (admin routes)
**Classification**: HOLDOUT — do not include in public training data

---

## Setup

- A CTO session cookie exists for org `org-abc`.
- Install `install-existing` already exists: `org_id = 'org-abc'`, `label = 'shared-dev'`, `revoked_at = NULL`.

---

## Primary scenario: duplicate label for non-revoked install

### Steps

1. Send `POST /api/v1/installs` with:
   - Cookie: valid `__Host-session` for org `org-abc`
   - Body: `{ "label": "shared-dev" }`

### Expected

- HTTP 409
- Response body: `{ "error": "label already in use" }`
- No new row is inserted into `installs`.

---

## EC-3: Label reuse is allowed after revocation

### Setup variation

- Install `install-revoked` exists: `org_id = 'org-abc'`, `label = 'recycled-label'`, `revoked_at = <non-null>` (revoked).

### Steps

1. Send `POST /api/v1/installs` with:
   - Cookie: valid `__Host-session` for org `org-abc`
   - Body: `{ "label": "recycled-label" }`

### Expected

- HTTP 201 (success — revoked installs do not block label reuse)
- A new row is inserted with `label = 'recycled-label'` and `revoked_at = NULL`.

---

## Cross-org isolation: same label, different org is NOT a duplicate

### Setup variation

- Install `install-other-org` exists: `org_id = 'org-xyz'`, `label = 'cross-org-label'`, `revoked_at = NULL`.

### Steps

1. Send `POST /api/v1/installs` with:
   - Cookie: valid `__Host-session` for org `org-abc`
   - Body: `{ "label": "cross-org-label" }`

### Expected

- HTTP 201 (success — label uniqueness is scoped per org, not globally)

---

## EC-5: Concurrent duplicate label

- Two simultaneous `POST /api/v1/installs` requests with `{ "label": "race-label" }` for the same org, with no prior install of that label.
- Exactly one must succeed with 201; the other must return 409.
- The mechanism (pre-insert SELECT check or DB UNIQUE constraint on `(org_id, label)` partial index) is an implementation choice, but the 409 outcome is required.
