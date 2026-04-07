# Scenario P-08: Admin cannot revoke installs from another org

**Spec**: api-key-management-server
**Requirement**: FR-8, BR-6
**Track**: B (admin routes)

---

## Setup

- A CTO session cookie exists for org `org-abc`.
- Install `install-other` exists with `org_id = 'org-xyz'` (a different org), `revoked_at = NULL`.

---

## Steps

1. Send `PATCH /api/v1/installs/install-other/revoke` with:
   - Cookie: valid `__Host-session` for org `org-abc`

---

## Expected

- HTTP 404
- Response body: `{ "error": "not found" }`
- The `installs` row for `install-other` remains unchanged: `revoked_at = NULL`.

---

## Security rationale

The response is deliberately 404 (not 403) to prevent cross-org enumeration. An attacker cannot distinguish "this install exists but belongs to another org" from "this install does not exist at all."

---

## Guard logic

The implementation must issue a query equivalent to:

```sql
SELECT id FROM installs
WHERE id = :pathId AND org_id = :sessionOrgId
```

If no row is returned (either wrong org or truly missing), return 404 — never 403.

---

## Parallel case: install exists, same org, not found path

| Install state | Session org | Expected |
|--------------|-------------|----------|
| `org_id = 'org-abc'`, exists | `org-abc` | 200 `{ ok: true }` (normal revoke) |
| `org_id = 'org-xyz'`, exists | `org-abc` | 404 (this scenario) |
| Does not exist | `org-abc` | 404 (indistinguishable) |
