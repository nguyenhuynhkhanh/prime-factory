# Feature: API Key Management — Server Layer (api-key-management-server)

## Context

The current install registration flow uses HMAC self-registration: a CLI user generates their own UUID, signs it with `API_KEY_SALT`, and calls `POST /api/v1/installs` unauthenticated. This approach is being replaced by an admin-driven model: a CTO generates an API key in the dashboard, labels it, and distributes it to the developer. The developer's machine then activates the key on first use by supplying its machine identity.

This sub-spec covers all server-side changes: the `requireApiKey` middleware, five new/replaced route files, and two active-count query fixes. It depends on the `api-key-management-data` sub-spec (schema migration) being deployed first.

---

## Scope

### In Scope (this spec)

- `lib/auth/requireApiKey.ts` — add revocation and expiry checks; add sliding expiry update; remove `API_KEY_SALT` misconfiguration guard
- `app/api/v1/installs/route.ts` — replace HMAC self-registration handler with admin key generation (`POST`)
- `app/api/v1/installs/[id]/revoke/route.ts` — new file: `PATCH` revoke endpoint
- `app/api/v1/installs/activate/route.ts` — new file: `POST` activate endpoint (Bearer-authed)
- `app/api/v1/orgs/route.ts` — new file: `PATCH` org name endpoint
- `app/api/v1/dashboard/installs/route.ts` — extend response shape with `label`, `revokedAt`, `expiresAt`, `isActivated`; these fields come from the new schema columns added by `api-key-management-data`
- `app/(dashboard)/page.tsx` — add `AND revoked_at IS NULL` to the active-installs count query
- `app/api/v1/dashboard/stats/route.ts` — add `AND revoked_at IS NULL` to the active-installs count query

### Out of Scope (explicitly deferred)

- Admin UI for key generation / revocation (separate front-end spec)
- Bulk revocation (e.g., revoke all installs for an org)
- Key rotation (generate a new key for an existing install without revoking)
- Audit log for revoke/activate events
- Email notification when a key is about to expire
- Any changes to `POST /api/v1/events` — the event ingestion contract is frozen
- `df-check-onboard.sh` network calls — confirmed local-only, no server changes needed

### Scaling Path

All routes live within the existing Next.js monolith. If admin key management becomes a high-traffic path (e.g., automated provisioning), these routes can be extracted to a dedicated service behind the same API gateway. The `label` + `orgId` scoping pattern makes that migration straightforward.

---

## Requirements

### Functional

- FR-1: `requireApiKey` must check `revokedAt IS NOT NULL` before checking `expiresAt`. A revoked key returns 403; an expired key returns 401.
- FR-2: `requireApiKey` must perform a fire-and-forget update of both `lastSeenAt` and `expiresAt` (sliding +30 days) on every successful auth. Errors are swallowed. This replaces the current `lastSeenAt`-only update.
- FR-3: `requireApiKey` must no longer require or check `API_KEY_SALT`. The env var may remain defined, but its absence must not cause a 500.
- FR-4: `POST /api/v1/installs` must be restricted to `requireCtoSession()` (admin session cookie). Unauthenticated calls return 401.
- FR-5: `POST /api/v1/installs` creates one install row per request with: server-generated UUID `id`, server-generated `apiKey` (32 random bytes, hex-encoded), `expiresAt = now + 30d`, `revokedAt = null`, `computerName = null`, `gitUserId = null`.
- FR-6: `POST /api/v1/installs` must enforce label uniqueness within the org: if any non-revoked install for the same org already has the same (trimmed, case-sensitive) label, return 409.
- FR-7: `POST /api/v1/installs` returns `201 { id, apiKey, label, expiresAt }`. `apiKey` is shown exactly once — it is never returned by any other endpoint.
- FR-8: `PATCH /api/v1/installs/[id]/revoke` must verify the target install belongs to `session.orgId`. Wrong org or not found returns 404 (intentionally indistinguishable to prevent enumeration).
- FR-9: `PATCH /api/v1/installs/[id]/revoke` is idempotent: revoking an already-revoked install returns 200 without error.
- FR-10: `POST /api/v1/installs/activate` authenticates via Bearer token (`requireApiKey`). The install is resolved from the token — no `id` in the path or body.
- FR-11: `POST /api/v1/installs/activate` overwrites `computerName` and `gitUserId` unconditionally (idempotent — always succeeds even if already activated). It also sets `expiresAt = now + 30d` and `lastSeenAt = now` in the same UPDATE.
- FR-12: `PATCH /api/v1/orgs` updates `orgs.name` scoped to `session.orgId`. The `orgId` is never read from the request body.
- FR-13: `GET /api/v1/dashboard/installs` response must include `label` (string), `revokedAt` (ISO string or null), `expiresAt` (ISO string), and `isActivated` (boolean: `computerName IS NOT NULL`) for each row. `computerName` and `gitUserId` become nullable in the response.
- FR-14: Active-install count queries in `app/(dashboard)/page.tsx` and `app/api/v1/dashboard/stats/route.ts` must add `AND revoked_at IS NULL` to the WHERE clause so revoked installs are excluded from the count.

### Non-Functional

- NFR-1: All timestamps are Unix seconds (integer). `expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60`.
- NFR-2: `apiKey` must never appear in GET responses, logs, or error messages. The dashboard installs query must continue to exclude it from the SELECT list.
- NFR-3: All error responses use `{ error: string }` shape with appropriate HTTP status.
- NFR-4: `requireApiKey` performs the SELECT, revocation check, expiry check, and fire-and-forget UPDATE entirely within the middleware — no additional DB round-trips in the calling route.
- NFR-5: The 200-row LIMIT on `GET /api/v1/dashboard/installs` is unchanged.

---

## Data Model

This spec reads from — but does not define — the schema changes introduced by `api-key-management-data`. The new schema shape expected:

```
installs:
  id             text PRIMARY KEY          -- server-generated UUID
  org_id         text NOT NULL
  label          text NOT NULL             -- admin-assigned, unique per org (non-revoked)
  computer_name  text NULL                 -- populated on first activate
  git_user_id    text NULL                 -- populated on first activate
  api_key        text NOT NULL UNIQUE
  expires_at     integer NOT NULL          -- Unix seconds
  revoked_at     integer NULL              -- Unix seconds, NULL = active
  created_at     integer NOT NULL
  last_seen_at   integer NULL
```

The `hmac` column is removed by `api-key-management-data`. This spec does not reference it.

---

## Migration & Deployment

This spec does not own the schema migration — that is `api-key-management-data`'s responsibility. However, the following deployment ordering is mandatory:

1. **Deploy `api-key-management-data` first**: schema migration must complete before any of this spec's code goes live.
2. **requireApiKey change**: once deployed, the middleware will query `revokedAt` and `expiresAt` on every API request. Both columns must exist and be NOT NULL / nullable as defined before deployment. Deploying this code against the old schema will cause runtime errors.
3. **Old `POST /api/v1/installs` handler**: the current handler references `installs.hmac` (a column removed by the migration). The replacement handler must be deployed atomically with or after the migration. There is no dual-read period — the old handler is fully replaced.
4. **Active count fix**: the `revoked_at IS NULL` filter is additive and safe to deploy before or after migration, but will only filter correctly after the migration adds the column. Deploying before migration = filter silently no-ops on old schema (no runtime error, slightly incorrect count until migration). Recommended: deploy with or after migration.
5. **Rollback**: if this code is rolled back post-migration, the `api-key-management-data` migration must also be rolled back (it is a paired deployment). Rolling back only the code while keeping the new schema is unsafe because the old `POST /api/v1/installs` handler references `hmac` which no longer exists.
6. **Zero-downtime**: the migration + code change can be deployed with zero downtime if migration runs first and the new installs route is deployed with no gap.

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/installs | Admin generates a new labeled API key | CTO session cookie |
| PATCH | /api/v1/installs/[id]/revoke | Revoke an install by ID | CTO session cookie |
| POST | /api/v1/installs/activate | Activate an install (set machine info) | Bearer API key |
| PATCH | /api/v1/orgs | Update org name | CTO session cookie |
| GET | /api/v1/dashboard/installs | List installs with stats (extended shape) | CTO session cookie |

---

## Business Rules

- BR-1: `orgId` is always sourced from the authenticated session — never from the request body or URL path. This applies to all admin routes.
- BR-2: A label is considered a duplicate if any non-revoked install in the same org has the same trimmed label. Revoked installs do not block label reuse.
- BR-3: `apiKey` is returned only in the `POST /api/v1/installs` 201 response. Any subsequent GET of install data must omit it.
- BR-4: `expiresAt` is set at key creation time (`now + 30d`). It is extended by another 30 days from the current time on every request that passes `requireApiKey` auth (sliding window).
- BR-5: An expired key (`expiresAt < now`) returns 401 from `requireApiKey`, not 403. A revoked key (`revokedAt IS NOT NULL`) returns 403.
- BR-6: Cross-org revocation must return 404 (same as not-found) to prevent org enumeration.
- BR-7: `POST /api/v1/installs/activate` is idempotent — calling it twice with the same or different values always succeeds and overwrites.
- BR-8: Revoked installs are excluded from active-install counts in both the dashboard page and stats API. They remain visible in `GET /api/v1/dashboard/installs` (historical events are preserved).
- BR-9: `computerName` and `gitUserId` are supplied by the CLI from the developer's machine. The server never infers them from network metadata (IP, user-agent, etc.).

---

## Error Handling

| Scenario | Response | Notes |
|----------|----------|-------|
| Bearer token absent or not "Bearer " prefix | 401 `{ error: "unauthorized" }` | requireApiKey |
| Bearer token does not match any install | 401 `{ error: "unauthorized" }` | requireApiKey |
| Install found but `revokedAt IS NOT NULL` | 403 `{ error: "api key revoked" }` | requireApiKey |
| Install found, not revoked, but `expiresAt < now` | 401 `{ error: "api key expired" }` | requireApiKey |
| `POST /installs` — no session or expired session | 401 (from requireCtoSession) | |
| `POST /installs` — `label` missing or empty | 400 `{ error: "missing required fields" }` | |
| `POST /installs` — `label` exceeds 64 chars | 400 `{ error: "label too long" }` | |
| `POST /installs` — label already in use (non-revoked, same org) | 409 `{ error: "label already in use" }` | |
| `PATCH /installs/[id]/revoke` — id not in org or not found | 404 `{ error: "not found" }` | |
| `PATCH /installs/[id]/revoke` — already revoked | 200 `{ ok: true }` | Idempotent |
| `POST /installs/activate` — both fields missing | 400 `{ error: "missing required fields" }` | |
| `POST /installs/activate` — field exceeds 255 chars | 400 `{ error: "computerName too long" }` or `{ error: "gitUserId too long" }` | |
| `PATCH /orgs` — `name` missing or empty | 400 `{ error: "missing required fields" }` | |
| `PATCH /orgs` — `name` exceeds 100 chars | 400 `{ error: "name too long" }` | |

---

## Acceptance Criteria

- [ ] AC-1: Calling `requireApiKey` with a valid, non-revoked, non-expired Bearer token succeeds and fires fire-and-forget update of `lastSeenAt` and `expiresAt`.
- [ ] AC-2: Calling `requireApiKey` with a revoked install's token returns 403 `{ error: "api key revoked" }`.
- [ ] AC-3: Calling `requireApiKey` with an expired install's token returns 401 `{ error: "api key expired" }`.
- [ ] AC-4: `requireApiKey` does NOT return 500 when `API_KEY_SALT` is absent or short.
- [ ] AC-5: `POST /api/v1/installs` with a valid admin session and `{ label: "my-machine" }` returns 201 `{ id, apiKey, label, expiresAt }` with a 64-char hex `apiKey`.
- [ ] AC-6: `POST /api/v1/installs` with the same label twice (same org, neither revoked) returns 409 on the second call.
- [ ] AC-7: `PATCH /api/v1/installs/[id]/revoke` sets `revokedAt` to the current time.
- [ ] AC-8: `PATCH /api/v1/installs/[id]/revoke` called twice returns 200 both times.
- [ ] AC-9: `PATCH /api/v1/installs/[id]/revoke` with an install from a different org returns 404.
- [ ] AC-10: `POST /api/v1/installs/activate` sets `computerName`, `gitUserId`, `expiresAt`, and `lastSeenAt` in one UPDATE.
- [ ] AC-11: `POST /api/v1/installs/activate` on an already-activated install overwrites values and returns 200.
- [ ] AC-12: `POST /api/v1/installs/activate` using a revoked key returns 403 (requireApiKey blocks it before handler runs).
- [ ] AC-13: `PATCH /api/v1/orgs` updates `orgs.name` for the session's org and returns `{ id, name }`.
- [ ] AC-14: `GET /api/v1/dashboard/installs` response includes `label`, `revokedAt`, `expiresAt`, `isActivated` for each install.
- [ ] AC-15: Active-install counts in both dashboard page and stats API exclude installs where `revoked_at IS NOT NULL`.
- [ ] AC-16: `GET /api/v1/dashboard/installs` continues to exclude `apiKey` from the SELECT list.

---

## Edge Cases

- EC-1: A revoked install that has historical events: `GET /api/v1/dashboard/installs` must still return the install row with its event stats; revocation does not erase history.
- EC-2: An install that has never been activated (`computerName = null`) appears in `GET /api/v1/dashboard/installs` with `isActivated: false` and `computerName: null`.
- EC-3: Label reuse after revocation: if install A with label "dev-1" is revoked, a new install with label "dev-1" should succeed (409 only applies to non-revoked installs).
- EC-4: `POST /api/v1/installs/activate` is called while the install is already past its original `expiresAt` — this is a normal re-activation scenario. `requireApiKey` blocks expired keys with 401. The admin must generate a new key if it has fully expired and not been refreshed.
- EC-5: Two concurrent `POST /api/v1/installs` requests with the same label — only one must succeed (409 for the other). D1 UNIQUE constraint on `(org_id, label)` for non-revoked rows handles this if enforced by index; alternatively a pre-insert SELECT check is acceptable but may have a race window. The 409 behavior is the required outcome regardless of implementation.
- EC-6: `PATCH /api/v1/orgs` with `orgId` present in the body — body `orgId` must be silently ignored; only `session.orgId` is used.
- EC-7: The sliding expiry update (`expiresAt = now + 30d`) in `requireApiKey` is fire-and-forget. If the UPDATE fails (e.g., D1 transient error), the request still succeeds. The key may expire sooner than expected in this case, which is acceptable.
- EC-8: `POST /api/v1/installs` with `label` containing only whitespace — trimmed label is empty, must return 400.
- EC-9: `PATCH /api/v1/installs/[id]/revoke` with a malformed UUID in the path — no matching row, returns 404 (no special UUID validation required; the SELECT will simply return 0 rows).

---

## Dependencies

- **Depends on**: `api-key-management-data` — must be complete and deployed before this spec is implemented. This spec assumes the new `installs` schema (with `label`, `expires_at`, `revoked_at`, nullable `computer_name`/`git_user_id`, absent `hmac`).
- **Depended on by**: any front-end spec that surfaces admin key management UI
- **Group**: api-key-management

---

## Implementation Size Estimate

- **Scope size**: large (6–10 files modified/created)
- **Suggested parallel tracks**: 2

  **Track A — Middleware + Auth-dependent routes (3 files)**
  - `lib/auth/requireApiKey.ts` (update)
  - `app/api/v1/installs/[id]/revoke/route.ts` (new)
  - `app/api/v1/installs/activate/route.ts` (new)
  - Rationale: all three depend on the updated `requireApiKey` contract. `activate` uses Bearer auth; `revoke` is independent but small and logically paired.

  **Track B — Admin routes + Dashboard fixes (5 files)**
  - `app/api/v1/installs/route.ts` (replace)
  - `app/api/v1/orgs/route.ts` (new)
  - `app/api/v1/dashboard/installs/route.ts` (update response shape)
  - `app/(dashboard)/page.tsx` (add revoked_at IS NULL)
  - `app/api/v1/dashboard/stats/route.ts` (add revoked_at IS NULL)
  - Rationale: all use `requireCtoSession()` and are independent of requireApiKey changes.

  Zero file overlap between tracks.

---

## Implementation Notes

- Use `getDatabase()` from `lib/db.ts` and `requireCtoSession()` from `lib/auth/requireCtoSession.ts` — same pattern as all existing routes.
- `getCloudflareContext()` is only needed in routes that access Cloudflare env bindings. After removing the `API_KEY_SALT` check, `requireApiKey.ts` no longer needs `getCloudflareContext()`.
- API key generation: `crypto.getRandomValues(new Uint8Array(32))` then hex-encode. This is the exact same pattern as the current `POST /api/v1/installs` (lines 212–214 of the current file). Reuse the `bytesToHex` helper or inline it.
- Server UUID generation for new install `id`: `crypto.randomUUID()` — same as `app/api/v1/events/route.ts` line 195.
- All Drizzle queries against the new schema columns (`label`, `expiresAt`, `revokedAt`) require the `api-key-management-data` migration to have run. Do not add these fields to `db/schema.ts` — that is owned by the data spec.
- `isActivated` in the dashboard installs response: computed as `row.computer_name !== null` (or `IS NOT NULL` in SQL). Do not add a dedicated column.
- `GET /api/v1/dashboard/installs` continues to use a raw `sql` template (not Drizzle query builder) — extend the SELECT list in the existing template.
- Dashboard active-count queries: the change is minimal — add `AND revoked_at IS NULL` to the existing WHERE clause in both files. The column is integer NULL so this is safe against the old schema (NULL != NULL, so if the column didn't exist it would error — but migration precedes deployment).

---

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (requireApiKey revoked → 403) | P-04, H-02 |
| FR-1 (requireApiKey expired → 401) | P-05 |
| FR-2 (sliding expiry fire-and-forget) | P-06 |
| FR-3 (no API_KEY_SALT guard) | P-04 (implicit — no 500) |
| FR-4/FR-5 (POST /installs admin-only, key gen) | P-01 |
| FR-6 (label uniqueness) | H-01 |
| FR-7 (apiKey shown once) | P-01 |
| FR-8/FR-9 (revoke cross-org, idempotent) | P-02, P-08 |
| FR-10/FR-11 (activate Bearer, idempotent) | P-03, H-03 |
| FR-12 (PATCH /orgs) | P-07 |
| FR-13 (dashboard installs extended shape) | P-01 (verify 201 fields), H-04 |
| FR-14 (active count excludes revoked) | H-04 |
| BR-2 (label uniqueness non-revoked only) | H-01, EC-3 note |
| BR-3 (apiKey not in GET) | P-01 (negative check) |
| BR-4/BR-7 (sliding expiry + activate idempotent) | P-06, H-03 |
| BR-5 (revoked 403 vs expired 401) | P-04, P-05 |
| BR-6 (cross-org → 404) | P-08 |
| BR-8 (revoked excluded from count) | H-04 |
| EC-1 (revoked install still in dashboard) | H-04 |
| EC-2 (unactivated install in dashboard) | H-04 |
| EC-3 (label reuse after revoke) | H-01 |
| EC-8 (whitespace-only label → 400) | P-01 (validation path) |
