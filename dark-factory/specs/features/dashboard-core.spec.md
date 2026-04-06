# Feature: dashboard-core

## Context

CTOs need a post-login landing page that answers three questions at a glance:

1. How many developers are actively using the pipeline right now?
2. Is the pipeline healthy — what fraction of events succeed vs. fail?
3. What happened recently, and on which machine?

Without this view, a CTO must query D1 directly to understand their org's pipeline health. The dashboard-core spec delivers the session-protected entry point for the entire `(dashboard)` route group and the overview page with aggregate stats and a recent-activity feed.

This is also the security gate: `(dashboard)/layout.tsx` is the single choke point that prevents unauthenticated access to every dashboard page built now and in the future (developer-management, event-explorer, etc.). Getting the session gate right here protects all future routes for free.

## Scope

### In Scope (this spec)

- `app/(dashboard)/layout.tsx` — async Server Component that reads the session cookie, calls `requireCtoSession`, and either redirects to `/login` or renders children.
- `app/(dashboard)/page.tsx` — async Server Component that fetches stats from `GET /api/v1/dashboard/stats` (HTTP call to its own route) and renders the CTO overview with stat cards, outcome breakdown, command breakdown, and recent activity feed.
- `app/api/v1/dashboard/stats/route.ts` — session-cookie-gated GET endpoint that runs three parallelized D1 queries and returns the aggregate stats payload.
- Two distinct empty states rendered in `page.tsx`:
  - Org has zero installs → "Share your invite link to get developers registered."
  - Org has installs but zero events → "Developers registered but no events yet."
- Display of the "active = last 30 days" definition visibly on the dashboard (e.g., label under the active installs count).
- Client-side timestamp formatting for `recentEvents[].createdAt` (browser local timezone).

### Out of Scope (explicitly deferred)

- Auto-refresh / polling — stats load once on page render, no websocket or interval refresh.
- Caching of stats responses — no `use cache`, no CDN cache headers; always live D1 data.
- Developer-management page (`app/(dashboard)/installs/page.tsx`) — separate spec.
- Event-explorer page (`app/(dashboard)/events/page.tsx`) — separate spec.
- Pagination of the recent activity feed — the feed is fixed at 10 items.
- Filtering or sorting controls on the overview page.
- Org invite-link generation UI — empty-state copy references the invite link but the link generation feature is out of scope here.
- Admin impersonation or multi-org views.

### Scaling Path

The stats route is currently implemented with direct D1 queries and no caching. If D1 read quota becomes a concern (5 M row reads/day on free tier), the natural next step is to add a `use cache` wrapper around a helper function (not inside the route handler body — see Cloudflare/OpenNext constraint in project profile) with a short TTL (e.g., 60 seconds). The `Promise.all` parallelization already minimizes wall-clock latency given the query count.

## Requirements

### Functional

- FR-1: `(dashboard)/layout.tsx` must call `requireCtoSession` before rendering children. If the session is invalid or expired, it must call `redirect('/login')`. This must happen server-side before any HTML is streamed. — Rationale: the layout is the only choke point protecting all current and future dashboard pages.
- FR-2: The layout must not pass `orgId` or session data to children via props (layouts cannot pass data to children in the App Router — see Next.js layout docs). Child pages that need `orgId` must call `requireCtoSession` themselves (or call the stats API which resolves it server-side). — Rationale: App Router constraint; passing data through layout props is not supported.
- FR-3: `GET /api/v1/dashboard/stats` must resolve `orgId` from the session cookie using `requireCtoSession`. It must never use an `orgId` supplied by the client. — Rationale: `orgId` scoping is the only data-isolation control.
- FR-4: All three D1 queries in the stats route must execute in parallel via `Promise.all`. — Rationale: reduces latency; queries are independent.
- FR-5: Every D1 query in the stats route must include `WHERE org_id = ?` bound to the session's `orgId`. — Rationale: strict org isolation; no cross-tenant data leakage.
- FR-6: `activeInstalls` is defined as `COUNT(*)` of installs where `last_seen_at > (now - 30 days)` AND `org_id = orgId`. — Rationale: developer confirmed this definition; "30 days" must be calculated as `Date.now() - 30 * 24 * 60 * 60 * 1000` in milliseconds, then converted to seconds for D1's integer timestamp comparison.
- FR-7: `eventsByOutcome` must include a key for each of the four schema-defined outcomes (`success`, `failed`, `blocked`, `abandoned`) plus an `unknown` key that aggregates rows where `outcome IS NULL`. Keys with zero count must still be present (value: 0). — Rationale: the `outcome` column is nullable; NULL rows exist when a CLI command is interrupted before completion.
- FR-8: `eventsByOutcome` and `eventsByCommand` are derived from a single aggregate query (`GROUP BY command, outcome`) to avoid a separate query. The route handler disaggregates the result set in application code. — Rationale: minimizes D1 read operations.
- FR-9: `recentEvents` returns the 10 most recent events ordered by `created_at DESC`, with fields: `id`, `installId`, `computerName`, `gitUserId`, `command`, `outcome`, `createdAt`. `computerName` and `gitUserId` must be joined from the `installs` table. — Rationale: the dashboard feed shows per-machine attribution.
- FR-10: `page.tsx` must detect the `activeInstalls === 0` empty state and render the actionable message "Share your invite link to get developers registered." — Rationale: new org onboarding UX.
- FR-11: `page.tsx` must detect the `activeInstalls > 0 && totalEvents === 0` empty state and render "Developers registered but no events yet." — Rationale: distinguishes pipeline-healthy-but-quiet from org-not-set-up-yet.
- FR-12: The dashboard UI must display a visible label showing the "active" definition (e.g., "Active in last 30 days") adjacent to the active installs stat. — Rationale: prevents CTO confusion about what "active" means.
- FR-13: `recentEvents[].createdAt` is returned as an ISO 8601 string. The UI must format it using the browser's locale (client-side, e.g., via a `'use client'` timestamp component). — Rationale: developer confirmed browser local timezone; server-side formatting would use the server timezone, which is wrong.
- FR-14: If `orgId` is absent from the resolved session object, `GET /api/v1/dashboard/stats` must return HTTP 500 with `{ "error": "Session data corrupt." }` and must not proceed to any D1 query. — Rationale: corrupt session state must be surfaced, not silently continue with an undefined org scope.

### Non-Functional

- NFR-1: The stats route must return a response within the D1 query timeout window. Three parallel queries on indexed columns should complete well within Cloudflare Worker CPU limits (50 ms CPU time on free tier). — Rationale: required indexes (`events(org_id)`, `events(org_id, created_at)`, `installs(org_id)`) are defined in the auth spec and must be present.
- NFR-2: No stack traces or raw D1 error messages must appear in API responses. All errors return `{ "error": string }` with an appropriate HTTP status. — Rationale: project-wide quality bar from `project-profile.md`.
- NFR-3: TypeScript strict mode. No `any` without an explanatory comment. — Rationale: project-wide quality bar.
- NFR-4: `eslint` must pass with no errors or warnings on all three files. — Rationale: project-wide quality bar; `npm run lint` is the CI gate.

## Data Model

No new tables or columns. This feature reads from existing tables:

- `sessions` — session lookup by cookie value, filtered by `expiresAt > now`
- `users` — joined in `requireCtoSession` to resolve `orgId`
- `installs` — active install count; joined into `recentEvents` for `computerName` and `gitUserId`
- `events` — aggregate counts and recent feed

Required indexes (defined in auth spec, must exist before this feature deploys):

| Index | Purpose |
|-------|---------|
| `events(org_id)` | Scopes aggregate scan to org |
| `events(org_id, created_at)` | Covers recent events ORDER BY |
| `installs(org_id)` | Scopes active install count |

## Migration & Deployment

N/A — no existing data affected. This feature creates new files only (`app/(dashboard)/layout.tsx`, `app/(dashboard)/page.tsx`, `app/api/v1/dashboard/stats/route.ts`) and reads existing tables with no schema changes. The `app/(dashboard)/` directory does not yet exist and must be created.

Pre-deploy checklist:
1. Confirm the three required indexes from the auth spec are applied to D1 before deploying — without them, aggregate queries will full-scan the events table.
2. `requireCtoSession` from the auth spec must be deployed before this feature.
3. `lib/db.ts` from the auth spec must be deployed before this feature.

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/dashboard/stats | Aggregate stats for the authenticated CTO's org | Session cookie (`session=<token>`) |

### GET /api/v1/dashboard/stats — Response shape

```json
{
  "activeInstalls": 12,
  "totalEvents": 3847,
  "eventsByOutcome": {
    "success": 2901,
    "failed": 412,
    "blocked": 89,
    "abandoned": 221,
    "unknown": 224
  },
  "eventsByCommand": {
    "df-intake": 1200,
    "df-debug": 980,
    "df-orchestrate": 750,
    "df-onboard": 600,
    "df-cleanup": 317
  },
  "recentEvents": [
    {
      "id": "uuid",
      "installId": "uuid",
      "computerName": "macbook-pro-alice",
      "gitUserId": "alice@example.com",
      "command": "df-intake",
      "outcome": "success",
      "createdAt": "2026-04-06T14:23:00.000Z"
    }
  ]
}
```

Notes on response shape:
- `eventsByOutcome`: all five keys always present, zero-valued if no events with that outcome exist.
- `eventsByCommand`: only commands that have at least one event appear. If no events exist, this is an empty object `{}`.
- `recentEvents`: array of 0–10 items. `outcome` may be `null` if the event was recorded without a terminal outcome.
- `createdAt` on recent events: Unix timestamp (integer seconds from D1) serialized as ISO 8601 string by the route handler.

## Business Rules

- BR-1: `orgId` used in all D1 queries is sourced exclusively from the validated session. The client has no mechanism to supply or override it. — Prevents cross-tenant data access.
- BR-2: "Active" means `installs.last_seen_at > (now - 30 * 24 * 60 * 60)` where `now` is Unix seconds at query time. The 30-day window is calculated fresh on every request (no caching). — Ensures the count reflects the actual rolling window.
- BR-3: An event with `outcome = NULL` is counted in `eventsByOutcome.unknown`, not silently dropped. — NULL outcomes occur when CLI commands are interrupted before the outcome is written.
- BR-4: `totalEvents` is the COUNT of all events for the org, regardless of outcome or command. — This is the denominator for the CTO's pipeline health assessment.
- BR-5: The stats route must return HTTP 401 (not redirect) for missing or expired sessions — it is an API route, not a UI route. The layout handles UI redirect separately. — Callers (including `page.tsx` fetching from the same origin) must handle 401 by surfacing an error or triggering a navigation to `/login`.
- BR-6: The layout's `redirect('/login')` is unconditional on session failure — it does not attempt to render a partial page or pass an error to children.

## Error Handling

| Scenario | HTTP Status | Response Body | Side Effects |
|----------|-------------|---------------|--------------|
| No `session` cookie present | 401 | `{ "error": "Unauthorized." }` | None |
| Session token not found in D1 | 401 | `{ "error": "Unauthorized." }` | None |
| Session found but `expiresAt` in the past | 401 | `{ "error": "Unauthorized." }` | None |
| Session valid but `orgId` absent from resolved user | 500 | `{ "error": "Session data corrupt." }` | None |
| D1 query failure (any of the three) | 500 | `{ "error": "Internal server error." }` | None — do not expose D1 error message |
| Wrong HTTP method (e.g., POST to stats route) | 405 | Next.js default 405 | None |

## Acceptance Criteria

- [ ] AC-1: Navigating to any `/(dashboard)/*` route without a valid session cookie redirects the browser to `/login` with no dashboard HTML rendered.
- [ ] AC-2: Navigating to `/(dashboard)` with a valid session cookie renders the overview page with stat cards visible.
- [ ] AC-3: `GET /api/v1/dashboard/stats` with a valid session cookie returns HTTP 200 with all five `eventsByOutcome` keys present.
- [ ] AC-4: `GET /api/v1/dashboard/stats` with no cookie returns HTTP 401 `{ "error": "Unauthorized." }`.
- [ ] AC-5: `GET /api/v1/dashboard/stats` with an expired session token returns HTTP 401 `{ "error": "Unauthorized." }`.
- [ ] AC-6: An org with zero installs renders the message "Share your invite link to get developers registered." on the overview page.
- [ ] AC-7: An org with installs but zero events renders "Developers registered but no events yet." on the overview page.
- [ ] AC-8: The overview page displays a visible label indicating the 30-day definition of "active" adjacent to the active installs count.
- [ ] AC-9: `recentEvents` in the stats response contains at most 10 items, ordered newest-first.
- [ ] AC-10: The stats response for an org with only NULL-outcome events shows `eventsByOutcome.unknown > 0` and all other outcome keys as 0.
- [ ] AC-11: `GET /api/v1/dashboard/stats` does not return any data belonging to a different org, even if a valid session for that org's CTO is used to call the endpoint.

## Edge Cases

- EC-1: Session cookie present but malformed (not a valid UUID / not matching any row) — treated identically to missing cookie: 401.
- EC-2: Session row exists but associated `users` row has been deleted — `requireCtoSession` cannot resolve `orgId`; route returns 500 "Session data corrupt." (this is a data integrity issue, not an auth issue).
- EC-3: All events for an org have `outcome = NULL` — `eventsByOutcome.unknown` equals `totalEvents`; all other outcome keys are 0.
- EC-4: An org has installs with `last_seen_at = NULL` (registered but never seen since registration) — these installs are NOT counted as active. `NULL` does not satisfy `last_seen_at > threshold`.
- EC-5: An org has installs with `last_seen_at` exactly equal to the 30-day boundary timestamp — these are NOT counted as active (strictly greater-than comparison).
- EC-6: `recentEvents` join on `installs` — if an `events` row references an `install_id` that no longer exists (orphaned event, data integrity gap), the join must not silently drop the event. Use a LEFT JOIN; `computerName` and `gitUserId` will be `null` for orphaned events.
- EC-7: `eventsByCommand` for an org with events only for two commands (e.g., `df-intake`, `df-debug`) — only those two keys appear in the response object. No zero-padding for unobserved commands.
- EC-8: A CTO's org has 0 events but 1 or more installs — `recentEvents` is an empty array `[]`; `totalEvents` is 0; `eventsByOutcome` all zeros; `eventsByCommand` is `{}`.
- EC-9: `page.tsx` fetches the stats API from the same origin. If the stats API returns a non-200 status (e.g., because the session expired between layout render and page render), `page.tsx` must not crash with an unhandled exception — it should surface an error state.
- EC-10: Concurrent requests from the same CTO (e.g., two open tabs) — each request runs its own `requireCtoSession` lookup; no shared server state; no issue.

## Dependencies

- **Depends on**: `auth` spec (provides `lib/auth/requireCtoSession.ts`, `lib/db.ts`, `sessions` table, `users` table, required D1 indexes). The auth spec must be fully deployed before this feature is implemented.
- **Depended on by**: `developer-management` spec and `event-explorer` spec — both use the `(dashboard)/layout.tsx` session gate created here. Any change to the session gate contract affects them.
- **Group**: dashboard

## Implementation Size Estimate

- **Scope size**: medium (3 files)
- **Suggested parallel tracks**: 2 tracks
  - Track 1: `app/api/v1/dashboard/stats/route.ts` — the data layer. Implement `requireCtoSession` call, `Promise.all` with three D1 queries, response assembly including `eventsByOutcome` zero-padding and `unknown` bucket, ISO 8601 serialization of timestamps.
  - Track 2: `app/(dashboard)/layout.tsx` + `app/(dashboard)/page.tsx` — the UI layer. Implement session gate in layout; implement stats fetch, stat card rendering, empty state logic, and client-side timestamp component in page.
  - Zero file overlap between tracks. Track 2 can stub the stats API call with a hardcoded fixture to develop in parallel, then swap to the real endpoint when Track 1 merges.

## Implementation Notes

- `getCloudflareContext()` must only be called inside the route handler function body, never at module scope (project-profile.md constraint).
- `lib/db.ts` is the single place that calls `getCloudflareContext()` — import the db helper from there, do not call `getCloudflareContext()` directly in the route handler.
- Use `import { cookies } from 'next/headers'` in the layout (async Server Component); `cookies()` returns a Promise in Next.js 16 and must be awaited before reading values.
- The `redirect()` call in the layout must come from `'next/navigation'`, not `'next/dist/...'`.
- For client-side timestamp formatting, create a small `'use client'` component (e.g., `app/(dashboard)/_components/LocalTimestamp.tsx`) that accepts an ISO string and renders it via `new Date(iso).toLocaleString()`. This avoids hydration mismatches from SSR timezone differences.
- The three D1 queries:
  1. Active installs: `SELECT COUNT(*) as count FROM installs WHERE org_id = ? AND last_seen_at > ?` (threshold = current Unix seconds minus 2592000).
  2. Event aggregates: `SELECT command, outcome, COUNT(*) as count FROM events WHERE org_id = ? GROUP BY command, outcome` — disaggregate in JS to build both `eventsByOutcome` and `eventsByCommand` and `totalEvents`.
  3. Recent events: `SELECT e.id, e.install_id, i.computer_name, i.git_user_id, e.command, e.outcome, e.created_at FROM events e LEFT JOIN installs i ON e.install_id = i.id WHERE e.org_id = ? ORDER BY e.created_at DESC LIMIT 10`.
- Drizzle ORM is available but raw SQL via `db.run()` / `db.all()` is acceptable for these aggregate queries where Drizzle's query builder would be more verbose.
- `outcome` in the schema is typed as `text("outcome", { enum: [...] })` but is nullable — TypeScript type will be `"success" | "failed" | "blocked" | "abandoned" | null`. Handle accordingly when building the `eventsByOutcome` map.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01, P-02, H-01, H-02 |
| FR-2 | H-03 |
| FR-3 | H-04 |
| FR-4 | H-05 |
| FR-5 | H-04, P-05 |
| FR-6 | P-04, H-06 |
| FR-7 | P-06, H-07, H-08 |
| FR-8 | (covered by P-03, P-06 — single query disaggregation verified via response shape) |
| FR-9 | P-03, H-09 |
| FR-10 | P-07 |
| FR-11 | P-08 |
| FR-12 | P-09 |
| FR-13 | P-10 |
| FR-14 | H-10 |
| BR-1 | H-04 |
| BR-2 | P-04, H-06 |
| BR-3 | P-06, H-07 |
| BR-4 | P-03 |
| BR-5 | P-05, H-01 |
| BR-6 | P-01, P-02 |
| EC-1 | H-01 |
| EC-2 | H-10 |
| EC-3 | H-07 |
| EC-4 | H-06 |
| EC-5 | H-06 |
| EC-6 | H-09 |
| EC-7 | H-08 |
| EC-8 | P-08 |
| EC-9 | H-11 |
| EC-10 | H-05 |
