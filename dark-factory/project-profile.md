# Dark Factory — Project Profile

> Last updated: 2026-04-06

---

## 1. What this project is

**prime-factory** is the web dashboard and API backend for the Dark Factory CLI (`df-*` commands). It has two distinct clients:

| Client | Who | How they authenticate |
|---|---|---|
| CTO dashboard | CTOs — log in via web browser | Email + password → session cookie |
| Dark Factory CLI | Developers — registered via `df-onboard` | Static API key sent as `Authorization: Bearer` header |

The system records telemetry events from every CLI command run so CTOs can observe pipeline health across their developer installs.

---

## 2. Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16.2.2 (App Router) | React 19, TypeScript 5 |
| CSS | Tailwind CSS v4 | PostCSS pipeline |
| Deployment | Cloudflare Pages via `@opennextjs/cloudflare` v1 | Free tier, serverless only |
| Database | Cloudflare D1 (SQLite-at-edge) | Binding name `DB` |
| ORM | Drizzle ORM + drizzle-kit | Schema lives in `db/schema.ts`, migrations in `db/migrations/` |
| Runtime env access | `getCloudflareContext()` from `@opennextjs/cloudflare` | Returns `env.DB` and other bindings inside route handlers |
| Fonts | Geist / Geist Mono via `next/font` | Already wired in `app/layout.tsx` |

### Key constraints

- **No Node.js runtime.** Cloudflare Workers are V8-isolate only — no `fs`, `crypto` (use `globalThis.crypto`), no `child_process`.
- **No server-side persistent memory.** Every request is stateless. Sessions must be stored in D1 or cookies.
- **Free tier D1 limits.** 5 GB storage, 5 M row reads/day, 100 K row writes/day. Keep telemetry writes lean — batch if volume grows.
- **OpenNext wraps Next.js.** `getCloudflareContext()` is the only supported way to access Cloudflare bindings inside Route Handlers and Server Actions.

---

## 3. Database schema (as-built)

```
users       id, email, passwordHash, role(cto|developer), orgId, createdAt, lastActiveAt
orgs        id, name, createdAt
installs    id(=userId from CLI), orgId, computerName, gitUserId, hmac, apiKey, createdAt, lastSeenAt
events      id, installId, orgId, command, subcommand, startedAt, endedAt, durationMs,
            outcome, featureName, roundCount, promptText, sessionId, createdAt
sessions    id, userId, expiresAt, createdAt
```

`installs.hmac` is a server-verified HMAC of `(userId + computerName + gitUserId)` using `API_KEY_SALT`. This binds an API key to a specific machine identity so a leaked key cannot be replayed from an arbitrary host.

---

## 4. Auth design

### 4a. CTO web dashboard — opaque session token in an HttpOnly cookie

**Recommendation: opaque random token stored in D1, not a JWT.**

Rationale: The `sessions` table already exists in the schema. Storing a random 32-byte hex token in D1 and looking it up on each request is simpler, more revocable, and avoids JWT expiry/rotation complexity. On Cloudflare free tier the extra D1 lookup is cheap and the row count for sessions will be tiny (handful of CTOs).

Flow:

```
POST /api/auth/login
  ← validates email + bcrypt password hash from `users`
  ← inserts row into `sessions` (id=crypto.randomUUID(), expiresAt=now+7d)
  → Set-Cookie: session=<id>; HttpOnly; Secure; SameSite=Lax; Path=/
  → { ok: true }

GET  /api/auth/me          (reads cookie, joins sessions→users, returns { id, email, role, orgId })
POST /api/auth/logout      (deletes session row, clears cookie)
```

Session middleware: a shared helper `lib/auth/requireCtoSession.ts` that:
1. Reads the `session` cookie.
2. Queries D1 for the session row (`expiresAt > now`).
3. Returns the `userId` / `orgId`, or responds `401`.

Used by all dashboard Route Handlers and Server Actions.

**No JWT.** The `JWT_SECRET` env var in `.env.local` is a vestige from an earlier design. Keep it defined for now but do not use it for CTO sessions.

### 4b. CLI — API key as Bearer token

The CLI sends `Authorization: Bearer <apiKey>` on every request. API keys are stored as plaintext in `installs.apiKey` (they are already random and unguessable — hashing them adds cost with no security benefit at this scale).

Middleware helper `lib/auth/requireApiKey.ts`:
1. Extracts the Bearer token from `Authorization` header.
2. Queries `installs` by `apiKey`.
3. Returns the `{ installId, orgId }` context, or responds `401`.
4. Side-effect: updates `installs.lastSeenAt = now` (best-effort, no transaction needed).

### 4c. Password hashing

Use the Web Crypto API (`globalThis.crypto.subtle`) with PBKDF2 — no `bcrypt` (requires Node.js native module). A minimal helper in `lib/auth/password.ts`:

```ts
// hash:   PBKDF2-SHA256, 100_000 iterations, 32-byte output, base64-encoded with prepended salt
// verify: re-derive and constant-time compare with crypto.subtle.timingSafeEqual equivalent
```

At MVP scale (handful of CTOs) this is fine. Argon2 would be ideal but has no pure-Web-Crypto implementation.

---

## 5. API route structure

### Design principle

The schema has an `orgs` table, and the developer questioned whether an `/api/orgs` route is actually needed. **Recommendation: do not build an `/api/orgs` CRUD route.** Reasoning:

- There is no org self-service UI. CTOs belong to an org established at signup; developers are assigned to an org when the CLI registers them with an invite code or org slug.
- Exposing org mutation via API creates surface area with no current consumer.
- `orgId` is a filter dimension on reads (dashboard queries, telemetry), not a managed resource yet.

Org creation can happen inline during CTO signup (`POST /api/auth/signup`) — create the org row and the user row in the same D1 transaction.

### Recommended route map

All routes live under `app/api/`.

#### Auth (no auth required)

```
POST  /api/auth/signup          Create org + CTO user account (web onboarding)
POST  /api/auth/login           Email + password → session cookie
POST  /api/auth/logout          Clear session cookie + delete session row
GET   /api/auth/me              Return current CTO user (requires session cookie)
```

#### CLI — install registration (no auth on POST; API key issued here)

```
POST  /api/installs             Register a new CLI install → returns { apiKey }
                                Body: { userId, orgId, computerName, gitUserId, hmac }
                                Verifies HMAC server-side before inserting.
```

No `GET /api/installs` at MVP — the dashboard reads installs via a Server Component directly.

#### CLI — telemetry (API key auth)

```
POST  /api/events               Ingest a single telemetry event from the CLI
                                Header: Authorization: Bearer <apiKey>
                                Body: { command, subcommand?, startedAt, endedAt?, durationMs?,
                                        outcome?, featureName?, roundCount?, promptText?, sessionId? }
```

`installId` and `orgId` are resolved from the authenticated API key — the CLI does not send them.

#### Dashboard — read-only data (session cookie auth)

```
GET   /api/dashboard/installs   List installs for the CTO's org
GET   /api/dashboard/events     Paginated event feed for the CTO's org
                                Query params: ?installId=&command=&outcome=&from=&to=&page=&limit=
GET   /api/dashboard/stats      Aggregate stats: command counts, outcome breakdown, active installs
```

Dashboard reads are CTO-org-scoped — always filter by `orgId` from the session.

### What was dropped and why

| Route | Decision | Reason |
|---|---|---|
| `GET/PUT /api/orgs` | Not built | No self-service org management use case at MVP |
| `GET/DELETE /api/installs/:id` | Not built | Dashboard reads via Server Component; revocation is a future feature |
| `GET /api/events/:id` | Not built | No single-event detail view needed |

---

## 6. File structure conventions

```
app/
  api/
    auth/
      signup/route.ts
      login/route.ts
      logout/route.ts
      me/route.ts
    installs/route.ts
    events/route.ts
    dashboard/
      installs/route.ts
      events/route.ts
      stats/route.ts
  (dashboard)/            ← route group, session-protected UI
    layout.tsx            ← session gate (redirect to /login if no cookie)
    page.tsx              ← CTO overview
    installs/page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
  layout.tsx
  page.tsx                ← redirect to /dashboard or /login

db/
  schema.ts
  client.ts               ← getDb(d1: D1Database)
  migrations/

lib/
  auth/
    requireCtoSession.ts  ← session middleware helper
    requireApiKey.ts      ← CLI auth middleware helper
    password.ts           ← PBKDF2 hash + verify (Web Crypto)
  db.ts                   ← thin wrapper: getCloudflareContext() → getDb(env.DB)
```

`lib/db.ts` should be the single place that calls `getCloudflareContext()` so the binding access is not scattered across route files.

---

## 7. Cloudflare env / bindings

All secrets are accessed through `getCloudflareContext().env` inside route handlers and server actions — **not** via `process.env` for secrets that need to be Cloudflare bindings. Plain build-time constants (e.g. app name) can use `process.env`.

Current bindings (`wrangler.jsonc`):

| Binding | Type | Purpose |
|---|---|---|
| `DB` | D1Database | Primary database |

Secrets stored as Cloudflare Pages environment variables (not in `wrangler.jsonc`):

| Variable | Purpose |
|---|---|
| `API_KEY_SALT` | HMAC key for verifying CLI install payloads |

The `JWT_SECRET` variable in `.env.local` is unused under this auth design and should be removed in a future cleanup pass.

---

## 8. Quality bar (MVP)

- **TypeScript strict mode.** Already enabled via `tsconfig.json`. No `any` without a comment explaining why.
- **Route handler error shape.** All API routes return `{ error: string }` on failure with an appropriate HTTP status. Never leak stack traces or raw D1 errors.
- **Input validation.** Validate all incoming JSON bodies before touching D1. A lightweight inline check is fine at MVP — no need for Zod yet, but field-presence checks and type assertions are required.
- **Auth always first.** Auth middleware must run before any D1 query in protected routes. No request should reach business logic without an authenticated identity.
- **No unauthenticated org data.** Every dashboard query must include `WHERE org_id = ?` scoped to the authenticated session's `orgId`.
- **HMAC verification on install.** `POST /api/installs` must verify the HMAC before inserting. This is the only integrity check on CLI registration.
- **ESLint passes.** `npm run lint` must be clean before any commit. Config is already set up.
- **No tests required at MVP.** Unit tests for `password.ts` and the HMAC helper are strongly encouraged but not blocking.

---

## 9. Future: rate limiting (planned, not yet implemented)

Cloudflare free tier does not include rate limiting natively (it is a paid add-on). When this is implemented:

- Primary targets: `POST /api/auth/login` (brute-force protection) and `POST /api/events` (telemetry flood protection).
- Recommended approach when ready: Cloudflare Workers Rate Limiting API (available on paid plans) keyed on IP for login, on `installId` for telemetry ingest.
- Do not build a D1-based rate limiter — the write volume would be too high and D1 is not designed for counter workloads.
- Until then: no rate limiting code exists and none should be added as a stub.

---

## 10. Structural notes and gotchas

- **`params` is a Promise in this version of Next.js.** Route Handler context params must be `await`ed: `const { id } = await ctx.params`. Do not destructure synchronously.
- **`GET` handlers are not cached by default** in Next.js 15+. Dashboard reads will always be dynamic — this is correct behavior since they query live D1 data.
- **`use cache` cannot be used directly in a Route Handler body.** Extract cached logic to a helper function if caching is ever added to dashboard reads.
- **`getCloudflareContext()` in dev.** `initOpenNextCloudflareForDev()` in `next.config.ts` enables the local proxy to Wrangler, so D1 bindings work during `next dev`. Do not call `getCloudflareContext()` at module initialization time — only inside request handlers.
- **D1 transactions.** Drizzle ORM supports D1 transactions via `db.transaction(async (tx) => { ... })`. Use a transaction for any multi-table write (e.g., creating org + user together in signup).
- **CORS.** The CLI is not a browser — it sends `Authorization: Bearer` headers directly. No CORS headers needed on `/api/installs` or `/api/events`. Only add CORS if a third-party web client ever needs access.
- **`orgs` table is kept.** Even though there is no `/api/orgs` route, the `orgs` table is the right place to store org metadata. Reads happen via joins in dashboard queries. Writes happen inline during CTO signup.
