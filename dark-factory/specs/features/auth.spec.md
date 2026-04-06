# Feature: Auth — CTO Web Auth + CLI Install Registration

## Context

prime-factory is a web dashboard and API backend for the Dark Factory CLI (`df-*` commands).
It serves two distinct clients:

1. **CTOs** — log in via browser with email + password, receive a session cookie, and use the dashboard to observe developer pipeline activity.
2. **Developers (CLI)** — register a machine via `df-onboard`, which calls `POST /api/v1/installs` and receives a static API key for all subsequent CLI requests.

This spec covers the entire auth foundation: password hashing, session management, all web auth routes, the `(auth)` UI pages, the `(dashboard)` session gate, and the CLI install registration endpoint. Every other spec in this system depends on this one being in place first.

---

## Scope

### In Scope (this spec)

- `lib/auth/password.ts` — PBKDF2-SHA256 hash + constant-time verify using Web Crypto
- `lib/auth/requireCtoSession.ts` — session cookie middleware helper for dashboard routes
- `lib/auth/requireApiKey.ts` — Bearer token middleware helper + `lastSeenAt` side-effect
- `lib/db.ts` — single `getCloudflareContext()` accessor returning a typed Drizzle instance
- `db/schema.ts` — add index declarations to the existing schema before first migration
- `db/migrations/` — generate initial migration via `drizzle-kit generate`
- `app/api/v1/auth/signup/route.ts` — create org + CTO user atomically; return invite link
- `app/api/v1/auth/login/route.ts` — email + password → set session cookie; clean up expired sessions
- `app/api/v1/auth/logout/route.ts` — delete session row + clear cookie
- `app/api/v1/auth/me/route.ts` — return current CTO user from session
- `app/api/v1/installs/route.ts` — CLI install registration with HMAC verification
- `app/(auth)/login/page.tsx` — login UI page
- `app/(auth)/signup/page.tsx` — signup UI page; post-signup shows copyable invite link
- `app/(dashboard)/layout.tsx` — Server Component session gate (redirect if no valid session)
- Removal note: stale empty dirs `app/api/v1/orgs/` and `app/api/v1/register/` must be deleted

### Out of Scope (explicitly deferred)

- Rate limiting on login or install endpoints (requires Cloudflare paid plan; noted in project profile)
- Password reset / forgot-password flow
- Email verification
- Org name editing or org management API
- Multiple CTOs per org (current model: one CTO creates the org at signup)
- API key rotation or revocation UI
- `GET /api/v1/installs` endpoint (dashboard reads installs via Server Component directly)
- Dashboard UI beyond the session gate layout (separate spec)
- `POST /api/v1/events` telemetry ingest (separate spec)
- Dashboard data routes (`/api/v1/dashboard/*`) — separate spec

### Scaling Path

The `LoyaltyService`-style isolation pattern is not needed here because auth is foundational infrastructure, not a pluggable domain. The `lib/auth/` helpers are already the correct abstraction boundary. If multi-org or multi-role becomes necessary, extend the session payload and the middleware helpers — the route handlers themselves do not need to change.

---

## Requirements

### Functional

- FR-1: CTO can sign up with email + password + org name. Org and user are created atomically (D1 transaction). On success, the response includes the org's invite link (`https://<host>/join?org=<orgId>`). — *Enables first-time onboarding without a separate org-creation step.*
- FR-2: CTO can log in with email + password. On success, a session cookie is set and expired sessions for that user are cleaned up. — *Keeps the sessions table lean on Cloudflare D1 free tier.*
- FR-3: CTO can log out. The session row is deleted and the cookie is cleared. — *Full revocation, not expiry-based.*
- FR-4: `GET /api/v1/auth/me` returns the current CTO's `{ id, email, role, orgId }` if session is valid; 401 otherwise. — *Used by the dashboard to hydrate user context.*
- FR-5: `POST /api/v1/installs` accepts `{ id, orgId, computerName, gitUserId, hmac }`, verifies the HMAC, validates that `orgId` exists in the `orgs` table, generates an API key, stores the install row, and returns `{ apiKey }`. — *The single registration event that gives the CLI its identity.*
- FR-6: `requireCtoSession` reads the `__Host-session` cookie, queries D1 for a non-expired session row, and returns the caller's `{ userId, orgId }` or responds 401. — *Centralises the session check so no route can forget it.*
- FR-7: `requireApiKey` extracts the Bearer token, looks up `installs.apiKey`, returns `{ installId, orgId }`, and performs a best-effort `lastSeenAt` update. — *Provides CLI identity context to telemetry and future routes.*
- FR-8: `lib/db.ts` exports a single `getDb()` function that calls `getCloudflareContext()` internally, so no route handler ever imports `getCloudflareContext` directly. — *Centralises the binding access as required by the Cloudflare/OpenNext constraint.*
- FR-9: The `(dashboard)/layout.tsx` Server Component reads the `__Host-session` cookie and redirects to `/login` if the session is missing or expired. — *Gate enforced at the layout level, not per-page.*
- FR-10: The signup page shows a copyable invite link after successful signup. The developer email is NOT displayed — only `gitUserId + computerName` will appear in the dashboard. — *Privacy boundary: email stays in the CTO domain.*
- FR-11: Indexes declared in `db/schema.ts`: `events(org_id)`, `events(org_id, created_at)`, `events(install_id)`, `installs(org_id)`. — *Required for dashboard queries to be performant on D1.*

### Non-Functional

- NFR-1: PBKDF2 hash format must be self-describing: `<base64salt>:<base64key>` where salt is a fresh random 32-byte value per hash. This allows algorithm migration without a forced reset. — *Lead C requirement.*
- NFR-2: `API_KEY_SALT` missing or set to a placeholder/empty value → hard 500 with `{ error: "server misconfiguration" }`. Must be checked at request time, not module load time (Cloudflare constraint). — *Prevents silent HMAC bypass with an empty key.*
- NFR-3: Password max length 1000 characters. Reject with 400 before hashing. — *DoS protection: PBKDF2 at 100K iterations on a 10 MB password would stall the isolate.*
- NFR-4: Email is lowercased on every write (signup) and every lookup (login). — *Case-insensitive email as per Lead A.*
- NFR-5: All API error responses use `{ error: string }`. Never leak stack traces, D1 error messages, or internal state. — *Consistent contract for all consumers.*
- NFR-6: Session cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. Cookie name: `__Host-session`. — *`__Host-` prefix requires `Secure` + `Path=/` + no `Domain`, which browsers enforce.*
- NFR-7: Session TTL is 7 days from creation. — *Balances UX (not logging in constantly) with security.*
- NFR-8: `installs.id` is the `userId` from the CLI, which is a UUID generated client-side. Validate UUID v4 format server-side before insert. — *Prevents injection and enforces the identity contract.*
- NFR-9: Web Crypto only — no Node.js `crypto` module. Use `globalThis.crypto.subtle` throughout `lib/auth/`. — *Cloudflare Workers V8 isolate constraint.*
- NFR-10: `getCloudflareContext()` must only be called inside request handlers, never at module initialisation time. — *Will throw outside a request context.*

---

## Data Model

### Schema changes to `db/schema.ts`

Add the following index declarations after the existing table definitions. Drizzle `index()` declarations live alongside the table using the second argument to `sqliteTable` (the `extra` config object):

```ts
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
  // ... existing columns unchanged ...
}, (t) => [
  index("events_org_id_idx").on(t.orgId),
  index("events_org_id_created_at_idx").on(t.orgId, t.createdAt),
  index("events_install_id_idx").on(t.installId),
]);

export const installs = sqliteTable("installs", {
  // ... existing columns unchanged ...
}, (t) => [
  index("installs_org_id_idx").on(t.orgId),
]);
```

Note: the `sessions` table comment currently reads "CTO JWT sessions" — rename the comment to "CTO sessions" since this design uses opaque tokens, not JWTs.

### New table: none

All required tables (`users`, `orgs`, `installs`, `events`, `sessions`) already exist in `db/schema.ts`. No new tables.

### Initial migration

Run `drizzle-kit generate` once after index declarations are added. This produces `db/migrations/0000_initial.sql`. Commit the migration file. Apply with `wrangler d1 migrations apply prime-factory --remote` for production and `--local` for dev.

---

## Migration & Deployment

This is the initial migration — there is no existing production data to migrate.

- **Existing data**: N/A — first deployment.
- **Rollback plan**: The migration adds only `CREATE TABLE` and `CREATE INDEX` statements. Rollback is dropping the tables (destructive but acceptable at pre-launch). No data-loss risk before any users exist.
- **Zero-downtime**: Yes — new tables with no prior dependents.
- **Deployment order**:
  1. Apply D1 migration (`wrangler d1 migrations apply ... --remote`).
  2. Deploy the Cloudflare Pages build.
  3. Set `API_KEY_SALT` as a Cloudflare Pages environment variable before any CLI registrations.
- **Stale data/cache**: N/A — first deployment, no cached values.
- **`JWT_SECRET` cleanup**: The `JWT_SECRET` variable in `.env.local` is unused. It should be removed from `.env.local` and any deployment documentation to avoid confusion. Do not remove any bindings from `wrangler.jsonc` (it is not listed there).

---

## API Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/v1/auth/signup` | Create org + CTO user atomically | None |
| POST | `/api/v1/auth/login` | Verify password, set session cookie | None |
| POST | `/api/v1/auth/logout` | Delete session, clear cookie | None (cookie required but 200 even if absent) |
| GET | `/api/v1/auth/me` | Return current CTO identity | Session cookie |
| POST | `/api/v1/installs` | Register CLI install, return API key | None (HMAC-protected) |

---

## Business Rules

- BR-1: Signup creates **org first, then user** within a single D1 transaction. If either insert fails, both are rolled back. — *Prevents orphan users with no org or orphan orgs with no CTO.*
- BR-2: Duplicate email on signup → 409 Conflict. The check relies on the `UNIQUE` constraint on `users.email`; catch the D1 constraint error and map it to 409. Email comparison is case-insensitive (store and compare lowercased). — *Prevents phantom duplicate accounts.*
- BR-3: On login, after session creation, run `DELETE FROM sessions WHERE expires_at < now AND user_id = ?`. This is a fire-and-forget cleanup — it must not fail the login if the DELETE errors. — *Keeps sessions table bounded without a separate cron job.*
- BR-4: Logout responds 200 even if the cookie is absent or the session row is not found. Attempts to delete the session row and clears the cookie regardless. — *Idempotent logout.*
- BR-5: `POST /api/v1/installs` HMAC verification: compute `HMAC-SHA256(API_KEY_SALT, userId + computerName + gitUserId)` and compare to the `hmac` field in the request body using a constant-time comparison. Reject with 403 if mismatch. — *Binds the API key to a specific machine identity.*
- BR-6: `POST /api/v1/installs` must verify that the `orgId` in the request body matches an existing row in the `orgs` table. Reject with 404 if the org does not exist. — *Prevents registration against a non-existent or fabricated org.*
- BR-7: `POST /api/v1/installs` with a `userId` (= `installs.id`) that already exists → 409 Conflict. — *Re-registration guard. The CLI can re-run `df-onboard` but must use a fresh `userId`.*
- BR-8: The API key returned by `POST /api/v1/installs` is a cryptographically random 32-byte value, hex-encoded (64 characters). It is stored in `installs.apiKey` as plaintext. — *Already random and unguessable; hashing adds latency with no security benefit at this scale.*
- BR-9: `requireApiKey` updates `installs.lastSeenAt` as a **best-effort side-effect** — wrap in try/catch and do not fail the request if the update errors. — *Telemetry data, not a correctness concern.*
- BR-10: The `(dashboard)/layout.tsx` session check must query D1 to confirm the session row exists and `expires_at > now`. Reading the cookie alone is not sufficient (cookie is opaque and may have been revoked). — *Logout revocation must be honoured.*

---

## Error Handling

| Scenario | HTTP Status | Response Body | Side Effects |
|----------|-------------|---------------|--------------|
| Signup: missing required field | 400 | `{ error: "missing required fields" }` | None |
| Signup: password > 1000 chars | 400 | `{ error: "password too long" }` | None |
| Signup: duplicate email | 409 | `{ error: "email already registered" }` | None |
| Login: missing email or password | 400 | `{ error: "missing required fields" }` | None |
| Login: email not found | 401 | `{ error: "invalid credentials" }` | None (do not leak which field failed) |
| Login: wrong password | 401 | `{ error: "invalid credentials" }` | None |
| Login: password > 1000 chars | 400 | `{ error: "password too long" }` | None |
| `GET /api/v1/auth/me`: no cookie | 401 | `{ error: "unauthorized" }` | None |
| `GET /api/v1/auth/me`: session expired or not found | 401 | `{ error: "unauthorized" }` | None |
| `POST /api/v1/installs`: missing required field | 400 | `{ error: "missing required fields" }` | None |
| `POST /api/v1/installs`: `id` not UUID format | 400 | `{ error: "invalid userId format" }` | None |
| `POST /api/v1/installs`: `API_KEY_SALT` missing | 500 | `{ error: "server misconfiguration" }` | None |
| `POST /api/v1/installs`: HMAC mismatch | 403 | `{ error: "invalid hmac" }` | None |
| `POST /api/v1/installs`: `orgId` not found | 404 | `{ error: "org not found" }` | None |
| `POST /api/v1/installs`: duplicate `userId` | 409 | `{ error: "already registered" }` | None |
| Any route: unhandled exception | 500 | `{ error: "internal server error" }` | Error must be logged server-side; stack must not appear in body |
| Dashboard layout: no/expired session | N/A | Redirect to `/login` | None |

---

## Acceptance Criteria

- [ ] AC-1: A fresh `POST /api/v1/auth/signup` with valid inputs creates exactly one row in `orgs` and one row in `users` within the same transaction. The response is 201 and includes `{ inviteLink }` in the form `https://<host>/join?org=<orgId>`.
- [ ] AC-2: `POST /api/v1/auth/signup` with the same email (any case variation) returns 409.
- [ ] AC-3: `POST /api/v1/auth/login` with correct credentials sets the `__Host-session` cookie with `HttpOnly; Secure; SameSite=Lax; Path=/` and returns 200.
- [ ] AC-4: After login, `GET /api/v1/auth/me` returns `{ id, email, role, orgId }` for the authenticated user.
- [ ] AC-5: `POST /api/v1/auth/logout` clears the session cookie and the session row is gone from D1.
- [ ] AC-6: `GET /api/v1/auth/me` with an expired session token returns 401.
- [ ] AC-7: `POST /api/v1/installs` with a valid payload and correct HMAC returns 201 with `{ apiKey }` (64-char hex string).
- [ ] AC-8: `POST /api/v1/installs` with a mismatched HMAC returns 403.
- [ ] AC-9: `POST /api/v1/installs` with a non-UUID `id` field returns 400.
- [ ] AC-10: `POST /api/v1/installs` with a non-existent `orgId` returns 404.
- [ ] AC-11: `POST /api/v1/installs` with an already-registered `userId` returns 409.
- [ ] AC-12: `POST /api/v1/installs` when `API_KEY_SALT` is absent returns 500 with `{ error: "server misconfiguration" }`.
- [ ] AC-13: Navigating to any `(dashboard)` route without a valid session cookie redirects to `/login`.
- [ ] AC-14: `lib/auth/password.ts` hashes encode as `<base64salt>:<base64key>` and verify correctly.
- [ ] AC-15: All four indexes (`events_org_id_idx`, `events_org_id_created_at_idx`, `events_install_id_idx`, `installs_org_id_idx`) are present in the generated migration SQL.
- [ ] AC-16: Password exceeding 1000 characters returns 400 at both signup and login before any hashing occurs.

---

## Edge Cases

- EC-1: Email submitted in mixed case (e.g., `CTO@Example.COM`) — must be lowercased to `cto@example.com` before storing and before lookup. Login with the original mixed-case email must succeed.
- EC-2: Password exactly 1000 characters — must be accepted. Password of 1001 characters — must be rejected with 400 before hashing.
- EC-3: `POST /api/v1/auth/logout` called twice in a row (session already deleted on first call) — both calls must return 200.
- EC-4: Session cookie is present but the row has been deleted from D1 (manual revocation or logout from another tab) — `requireCtoSession` must return 401, not 500.
- EC-5: `POST /api/v1/installs` with a `userId` that is a valid UUID format but not yet registered — must proceed normally (UUID format check is structural, not existence check).
- EC-6: `POST /api/v1/installs` with `orgId` that is syntactically valid but not in `orgs` table — must return 404, not 500.
- EC-7: Two simultaneous signup requests with the same email — D1's `UNIQUE` constraint is the final arbiter; both requests race to insert; exactly one succeeds (201) and the other gets 409.
- EC-8: Login cleans up expired sessions as a side-effect. If the cleanup `DELETE` itself throws, the login must still succeed — the cleanup is fire-and-forget.
- EC-9: `API_KEY_SALT` is set to an empty string `""` — this is indistinguishable from "missing" and must also return 500 with `{ error: "server misconfiguration" }`.
- EC-10: The session cookie is tampered with (invalid characters, wrong length, not a UUID) — the D1 lookup will simply find no row; must return 401, not 500.
- EC-11: `POST /api/v1/auth/signup` `orgName` is an empty string or only whitespace — must return 400.
- EC-12: HMAC comparison must be constant-time to prevent timing attacks. Do not use `===` on hex strings; use `crypto.subtle.timingSafeEqual` or equivalent.

---

## Dependencies

- **Depends on**: None — this is the foundation spec.
- **Depended on by**: All other specs (dashboard, events/telemetry, any future CLI route).
- **Group**: core-auth

---

## Implementation Size Estimate

- **Scope size**: large (approximately 8–10 files created from scratch, plus schema and migration modification)
- **Suggested parallel tracks**: 2 tracks, diverging after `lib/` is complete:

  **Track 0 — Foundation (must complete first, not parallelisable)**
  - `lib/db.ts`
  - `lib/auth/password.ts`
  - `lib/auth/requireCtoSession.ts`
  - `lib/auth/requireApiKey.ts`
  - `db/schema.ts` (index additions)
  - `db/migrations/0000_initial.sql` (generated via drizzle-kit)

  **Track 1 — Web auth routes + UI pages (starts after Track 0)**
  - `app/api/v1/auth/signup/route.ts`
  - `app/api/v1/auth/login/route.ts`
  - `app/api/v1/auth/logout/route.ts`
  - `app/api/v1/auth/me/route.ts`
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/signup/page.tsx`
  - `app/(dashboard)/layout.tsx`

  **Track 2 — CLI install route (starts after Track 0, independent of Track 1)**
  - `app/api/v1/installs/route.ts`

  Zero file overlap between Track 1 and Track 2 once Track 0 is complete.

---

## Implementation Notes

- The existing `db/client.ts` exports `getDb(d1: D1Database)`. `lib/db.ts` should call `getCloudflareContext().env.DB` and pass it to `getDb`. Route handlers import from `lib/db.ts`, never from `db/client.ts` directly or from `@opennextjs/cloudflare` directly.
- D1 transaction pattern: `db.transaction(async (tx) => { await tx.insert(orgs)...; await tx.insert(users)...; })` — wrap signup in a transaction per Drizzle's D1 support.
- Cookie name `__Host-session` requires `Secure; Path=/` and no `Domain` attribute — do not set `domain` in the cookie options.
- `next/headers` `cookies()` is async in this Next.js version (16.x) — always `await cookies()`.
- `crypto.subtle.importKey` + `crypto.subtle.deriveBits` for PBKDF2; `crypto.subtle.sign` with `HMAC` algorithm for the install HMAC. Both use `globalThis.crypto` — no import needed in the Workers runtime.
- For constant-time comparison of HMAC results: encode both the computed and provided HMAC as `Uint8Array` and use `crypto.subtle.timingSafeEqual` (available in Workers runtime via the Web Crypto API specification, though the method name in Workers is `crypto.subtle.timingSafeEqual` — verify against the Workers API docs; fallback: compare two `ArrayBuffer` results from `importKey`+`verify` using the HMAC `verify` operation which is natively constant-time).
- Stale empty directories `app/api/v1/orgs/` and `app/api/v1/register/` must be removed. Add a note in the PR description.
- The signup page (`app/(auth)/signup/page.tsx`) is a Client Component (needs `useState` for the post-signup invite link display). The login page can be a Server Component with a `<form>` pointing at the API route, or a Client Component — either is acceptable.
- `db/schema.ts` comment on `sessions` table: change "CTO JWT sessions" to "CTO sessions".

---

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02, H-01 |
| FR-2 | P-03, P-04, H-02, H-03, H-04 |
| FR-3 | P-05, H-05, H-06 |
| FR-4 | P-06, H-07 |
| FR-5 | P-07, P-08, P-09, P-10, H-08, H-09, H-10, H-11 |
| FR-6 | P-06, H-07, H-12 |
| FR-7 | P-11, H-13 |
| FR-8 | (implementation constraint — covered by integration of any route) |
| FR-9 | P-12, H-14 |
| FR-10 | P-02 |
| FR-11 | H-15 |
| NFR-1 | H-16 |
| NFR-2 | P-10, H-11 |
| NFR-3 | P-13, H-17 |
| NFR-4 | H-18 |
| NFR-5 | (covered by all error scenarios) |
| NFR-6 | P-03 |
| NFR-7 | H-07 |
| NFR-8 | P-09, H-09 |
| BR-1 | P-01, H-01 |
| BR-2 | P-04 (login case-insensitive), H-02 (duplicate email) |
| BR-3 | H-03 |
| BR-4 | H-05, H-06 |
| BR-5 | P-08, H-08, H-10 |
| BR-6 | P-09 |
| BR-7 | P-07 (success), H-09 (duplicate) |
| BR-8 | P-07 |
| BR-9 | H-13 |
| BR-10 | H-14 |
| EC-1 | H-18 |
| EC-2 | P-13, H-17 |
| EC-3 | H-05 |
| EC-4 | H-12 |
| EC-5 | P-07 |
| EC-6 | P-09 |
| EC-7 | H-19 |
| EC-8 | H-03 |
| EC-9 | H-11 |
| EC-10 | H-20 |
| EC-11 | H-21 |
| EC-12 | H-10 |
