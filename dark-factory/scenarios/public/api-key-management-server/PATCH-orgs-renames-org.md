# Scenario P-07: PATCH /orgs renames org

**Spec**: api-key-management-server
**Requirement**: FR-12, BR-1, EC-6
**Track**: B (admin routes)

---

## Setup

- A CTO session cookie exists for org `org-abc`.
- The `orgs` table has a row: `id = 'org-abc'`, `name = 'Old Corp'`.

---

## Steps

1. Send `PATCH /api/v1/orgs` with:
   - Cookie: valid `__Host-session` for org `org-abc`
   - Body: `{ "name": "New Corp" }`

---

## Expected

- HTTP 200
- Response body: `{ "id": "org-abc", "name": "New Corp" }`
- The `orgs` table row for `org-abc` now has `name = 'New Corp'`.

---

## Body injection guard (EC-6)

- Send `PATCH /api/v1/orgs` with body `{ "name": "Hack Corp", "orgId": "org-xyz" }`:
  - The route uses `session.orgId` (`org-abc`) — not the body `orgId`.
  - HTTP 200
  - `orgs` row for `org-abc` has `name = 'Hack Corp'`; row for `org-xyz` is unchanged.

---

## Validation sub-cases

| Body | Expected status | Expected error |
|------|-----------------|----------------|
| `{}` (no name) | 400 | `{ "error": "missing required fields" }` |
| `{ "name": "" }` | 400 | `{ "error": "missing required fields" }` |
| `{ "name": "   " }` (whitespace only) | 400 | `{ "error": "missing required fields" }` |
| `{ "name": "x".repeat(101) }` (101 chars) | 400 | `{ "error": "name too long" }` |
| `{ "name": "x".repeat(100) }` (100 chars) | 200 | — (boundary accepted) |
| No session cookie | 401 | (from requireCtoSession) |

---

## Note

`orgId` is derived exclusively from the session. The route has no path parameter and ignores any `orgId` field in the request body.
