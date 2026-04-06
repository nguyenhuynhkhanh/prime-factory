# Feature: Event Explorer

## Context

CTOs use this view to observe and investigate telemetry from every `df-*` CLI command run across their developer installs. The primary use case is investigation: "why did Alice's `df-orchestrate` fail last Tuesday?" The view must support filtering, bookmarkable/shareable URLs, and a clear empty state. It is the main operational window into pipeline health.

The `events` table already exists and is being populated by the event-ingestion pipeline. This feature adds the read path — a paginated, multi-filter API endpoint and the UI page that consumes it.

---

## Scope

### In Scope (this spec)

- `GET /api/v1/dashboard/events` — paginated, multi-filter, session-cookie-gated endpoint
- `app/(dashboard)/events/page.tsx` — Event Explorer page with filter bar and paginated list
- `<EventFilters>` client component (`'use client'`) embedded in the page for interactive filtering
- URL-persistent filter state (search params read by Server Component, written by client component)
- Server-side default date window: last 7 days when no `from` param is provided
- `durationMs` formatted as human-readable ("1m 23s") in the UI
- `outcome = null` displayed as "—" in the UI
- Empty state message when filters return no results
- `Cache-Control: no-store` on the API endpoint

### Out of Scope (explicitly deferred)

- Single-event detail view (`GET /api/v1/dashboard/events/:id`) — not needed at MVP
- Full-text search on `promptText` — excluded entirely; `promptText` is never returned
- Export (CSV, JSON download) — future feature
- Cursor-based pagination — offset/page is acceptable at MVP; cursor migration is noted below
- Real-time / push updates (SSE, WebSocket) — future feature
- Admin management of events (delete, edit) — read-only at MVP
- Rate limiting on this endpoint — planned but not yet built per project profile

### Scaling Path

- The LIMIT/OFFSET pagination pattern creates an inconsistency window when new events are ingested while a CTO is paging through results. This is documented and acceptable at MVP. When event volume grows, migrate to cursor-based pagination keyed on `(created_at DESC, id)`.
- If query latency degrades, add a composite index `(org_id, started_at DESC)` and consider adding `(org_id, command, started_at DESC)` for the filtered case.
- The `<EventFilters>` component is isolated behind a clean props interface; the parent Server Component can be upgraded to React Server Components streaming with no filter component changes.

---

## Requirements

### Functional

- FR-1: The endpoint MUST return only events belonging to the authenticated CTO's `orgId`. The `org_id` WHERE condition is always applied first, before any optional filter. — Prevents cross-org data leakage.
- FR-2: The endpoint MUST support filtering by `installId`, `command`, `outcome`, `from` (ISO 8601 UTC), `to` (ISO 8601 UTC). All filters are optional and additive (AND conditions). — Supports the investigation use case.
- FR-3: `from`/`to` filter applies to `started_at`. If `from` is not provided, the server defaults to `now - 7 days`. If `to` is not provided, there is no upper bound. — Prevents unbounded full-table scans on the first page load.
- FR-4: `command` values MUST be validated against the known enum before querying. An unrecognised value returns 400. — Prevents silent empty results from a typo and eliminates injection surface.
- FR-5: `outcome` values MUST be validated against the known enum before querying. An unrecognised value returns 400. — Same rationale as FR-4.
- FR-6: `from > to` MUST return 400 with a descriptive error. It MUST NOT silently return empty results. — Makes misconfigured filters obvious to the caller.
- FR-7: `installId` filter narrows results to events from that install. If the install belongs to a different org, the `org_id` base condition ensures zero results are returned — not a 403. — Install IDs are not secret; the org scope is the security boundary.
- FR-8: Pagination uses `page` (default 1) and `limit` (default 50, max 100). `page <= 0` is treated as page 1. `limit <= 0` is treated as 1. `limit > 100` is server-capped to 100. — Prevents runaway queries.
- FR-9: The response MUST include a `pagination` object: `{ page, limit, total, hasMore }`. `total` is the COUNT of matching rows (ignoring pagination). `hasMore` is `true` when `page * limit < total`. — Supports numbered pagination in the UI.
- FR-10: Two D1 queries per request (data SELECT + COUNT SELECT) MUST be issued in parallel via `Promise.all()`. — Minimises latency on the Cloudflare edge.
- FR-11: `promptText` MUST NEVER appear in any API response from this endpoint, regardless of what columns Drizzle selects. Explicitly exclude it in the SELECT column list. — `promptText` contains sensitive LLM prompt data.
- FR-12: The UI page reads filter state from URL search params (Server Component) and renders the list server-side. Filter changes update URL search params (client component, debounced 300ms). — Enables bookmarkable/shareable investigation URLs.
- FR-13: The `installId` filter dropdown is populated from `GET /api/v1/dashboard/installs`. Each option is displayed as `{gitUserId} ({computerName})`. — Human-readable identity in the filter UI.
- FR-14: When the filtered result set is empty, the UI MUST display: "No events match your filters — try widening the date range." — Clear empty state prevents confusion.
- FR-15: `durationMs` is displayed in the UI as a human-readable string (e.g., "1m 23s", "45s", "< 1s"). The raw millisecond value is available in the API response. — CTOs read durations at a glance; raw ms is not human-friendly.
- FR-16: `outcome = null` in the data MUST render as "—" in the UI. — Avoids blank cells that look like a rendering error.
- FR-17: `Cache-Control: no-store` MUST be set on all responses from the endpoint (including error responses). — Events are sensitive prompt-adjacent data; caching is unsafe.
- FR-18: All timestamps in the API response are ISO 8601 UTC strings. The UI formats them in the browser's local timezone. — UTC in transit; local display on client.

### Non-Functional

- NFR-1: The two D1 queries (data + COUNT) MUST be parallelised. Sequential queries are not acceptable. — Cloudflare D1 round-trip latency makes sequential queries unacceptably slow.
- NFR-2: TypeScript strict mode; no `any` without an explaining comment. — Project-wide quality bar.
- NFR-3: Auth middleware (`requireCtoSession`) runs before any D1 query. — Project-wide security requirement.
- NFR-4: All Drizzle queries MUST use parameterised conditions (Drizzle's `.where()` / `eq()` / `and()` / `gte()` / `lte()` / `between()`). Raw string interpolation into SQL is forbidden. — SQL injection prevention.
- NFR-5: The `<EventFilters>` component debounces filter change events by 300ms before updating URL search params. — Prevents a D1 query on every keystroke.
- NFR-6: Error responses follow the project-wide shape `{ error: string }`. Stack traces and raw D1 error messages MUST NOT be included. — Consistent API contract; no internal detail leakage.

---

## Data Model

No schema changes required. This feature is a read path over the existing `events` table.

Relevant columns returned in API responses (all others, including `promptText`, are excluded):

| Column | Type | Notes |
|--------|------|-------|
| `id` | text | UUID |
| `installId` | text | FK → installs.id |
| `computerName` | text | Joined from `installs` table |
| `gitUserId` | text | Joined from `installs` table |
| `command` | text | enum: df-intake, df-debug, df-orchestrate, df-onboard, df-cleanup |
| `subcommand` | text\|null | Optional subcommand flag |
| `startedAt` | ISO 8601 string | Converted from D1 integer timestamp |
| `endedAt` | ISO 8601 string\|null | May be null for in-flight events |
| `durationMs` | number\|null | Raw value; UI formats to human-readable |
| `outcome` | text\|null | enum: success, failed, blocked, abandoned — or null |
| `featureName` | text\|null | Feature being processed |
| `roundCount` | integer\|null | Number of LLM rounds |
| `sessionId` | text\|null | Correlates events in one pipeline run |
| `createdAt` | ISO 8601 string | When the row was inserted |

`computerName` and `gitUserId` require a JOIN from `events` to `installs` on `events.install_id = installs.id`. Both are scoped by the `org_id` base condition so no cross-org installs can appear.

**Recommended index** (if not already present): `CREATE INDEX IF NOT EXISTS idx_events_org_started ON events (org_id, started_at DESC);`

This index serves the default query (org-scoped, sorted by started_at DESC) and benefits all filtered variants because `org_id` is always the leading column.

---

## Migration & Deployment

N/A — no existing data affected. This feature adds a new read endpoint and UI page over the existing `events` table. No schema changes, no field renames, no cache key changes, no format changes to existing data. The `events` table already has rows from the event-ingestion pipeline; this feature reads them without modification.

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/dashboard/events` | Paginated, filtered event list for authenticated CTO's org | Session cookie (CTO role) |

### Request — Query Parameters

| Parameter | Type | Default | Validation |
|-----------|------|---------|------------|
| `installId` | string | — | Optional. If provided and belongs to a different org, returns empty results. |
| `command` | string | — | Optional. Must be one of: `df-intake`, `df-debug`, `df-orchestrate`, `df-onboard`, `df-cleanup`. Returns 400 otherwise. |
| `outcome` | string | — | Optional. Must be one of: `success`, `failed`, `blocked`, `abandoned`. Returns 400 otherwise. |
| `from` | ISO 8601 string | `now - 7 days` | Optional. Filters `started_at >= from`. Must be parseable as a date. |
| `to` | ISO 8601 string | — (no upper bound) | Optional. Filters `started_at <= to`. Must be parseable as a date. |
| `page` | integer | `1` | Optional. Values <= 0 treated as 1. |
| `limit` | integer | `50` | Optional. Values <= 0 treated as 1. Values > 100 capped to 100. |

### Response — 200 OK

```json
{
  "events": [
    {
      "id": "uuid",
      "installId": "uuid",
      "computerName": "alice-macbook",
      "gitUserId": "alice",
      "command": "df-orchestrate",
      "subcommand": "--group",
      "startedAt": "2026-04-01T10:00:00.000Z",
      "endedAt": "2026-04-01T10:01:23.000Z",
      "durationMs": 83000,
      "outcome": "failed",
      "featureName": "user-auth",
      "roundCount": 3,
      "sessionId": "uuid",
      "createdAt": "2026-04-01T10:01:24.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "hasMore": true
  }
}
```

`promptText` is NEVER included in any event object in any response. The Drizzle SELECT must name columns explicitly.

### Response — Error Cases

| Condition | Status | Body |
|-----------|--------|------|
| Missing or invalid session cookie | 401 | `{ "error": "Unauthorized" }` |
| `command` not in known enum | 400 | `{ "error": "Invalid command value" }` |
| `outcome` not in known enum | 400 | `{ "error": "Invalid outcome value" }` |
| `from > to` | 400 | `{ "error": "from must not be after to" }` |
| `from` or `to` not parseable as a date | 400 | `{ "error": "Invalid date format for from/to" }` |
| D1 query failure | 500 | `{ "error": "Internal server error" }` |

All error responses also carry `Cache-Control: no-store`.

---

## Business Rules

- BR-1: `org_id` from the authenticated session is ALWAYS the first AND condition in the WHERE clause. No query reaches D1 without this condition. — Core multi-tenancy guarantee.
- BR-2: `from` defaults to `now - 7 days` server-side when not provided. This is applied before the query, not as a fallback on empty results. — Prevents accidental full-table scans on first page load.
- BR-3: The `limit` parameter is server-capped at 100 regardless of what the client sends. Client-supplied values above 100 are silently reduced to 100. — Protects D1 read quota.
- BR-4: `page <= 0` is normalised to 1. `limit <= 0` is normalised to 1. These are not errors; they are sanitised inputs. — Defensive against programmatic clients sending bad values.
- BR-5: `from > to` is a 400 error, not an empty result set. The distinction matters for the CTO to know their filter is misconfigured. — Investigation usability.
- BR-6: Cross-org `installId` is silently scoped out by the `org_id` base condition. The response is an empty `events` array with `total: 0`. It is not a 403 — install IDs are not secret identifiers. — Consistent with project security model.
- BR-7: `promptText` is excluded at the SELECT level in the Drizzle query. It must not be filtered out after fetching; it must never be fetched. — Defence-in-depth; avoids accidental exposure through future refactors.
- BR-8: `computerName` and `gitUserId` are joined from the `installs` table. They are not stored redundantly on the `events` table. The JOIN is always inner-joined on `installId` (every event has a valid install). — Single source of truth for install identity.

---

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| No session cookie / expired session | 401 `{ "error": "Unauthorized" }` | None |
| `command=df-unknown` | 400 `{ "error": "Invalid command value" }` | None |
| `outcome=pending` | 400 `{ "error": "Invalid outcome value" }` | None |
| `from=2026-04-10&to=2026-04-01` | 400 `{ "error": "from must not be after to" }` | None |
| `from=not-a-date` | 400 `{ "error": "Invalid date format for from/to" }` | None |
| D1 timeout or binding error | 500 `{ "error": "Internal server error" }` | None — do not retry automatically |
| Valid filters, no matching rows | 200 `{ "events": [], "pagination": { "page": 1, "limit": 50, "total": 0, "hasMore": false } }` | None |

---

## Acceptance Criteria

- [ ] AC-1: `GET /api/v1/dashboard/events` with a valid session returns events scoped to the CTO's org only.
- [ ] AC-2: `promptText` is absent from every event object in every response.
- [ ] AC-3: `command` filter with an invalid value returns 400.
- [ ] AC-4: `outcome` filter with an invalid value returns 400.
- [ ] AC-5: `from > to` returns 400.
- [ ] AC-6: Default date window of last 7 days is applied server-side when `from` is absent.
- [ ] AC-7: `limit=200` in the query param is silently capped to 100 in the response's `pagination.limit`.
- [ ] AC-8: `page=0` is treated as page 1.
- [ ] AC-9: `pagination.total` reflects the total matching row count, not just the current page count.
- [ ] AC-10: `pagination.hasMore` is `true` when there are more pages.
- [ ] AC-11: Events from a different org's install do not appear even if `installId` is provided.
- [ ] AC-12: `Cache-Control: no-store` is present on all responses.
- [ ] AC-13: The UI page reads filters from URL search params and the filter bar writes to URL search params.
- [ ] AC-14: Filter changes are debounced 300ms before triggering a navigation.
- [ ] AC-15: Empty results display "No events match your filters — try widening the date range."
- [ ] AC-16: `durationMs` is rendered as human-readable ("1m 23s", "45s", "< 1s") in the UI.
- [ ] AC-17: `outcome = null` renders as "—" in the UI.
- [ ] AC-18: `computerName` and `gitUserId` are present in each event object in the response.
- [ ] AC-19: `no-store` is set on error responses (401, 400, 500) as well as 200 responses.

---

## Edge Cases

- EC-1: Both data and COUNT queries fail simultaneously — respond 500; do not partially render.
- EC-2: COUNT query succeeds but data query fails (or vice versa) — respond 500; do not return partial data with incorrect totals.
- EC-3: `from` and `to` are identical (same instant) — valid; returns events where `started_at` equals that exact timestamp. Not a 400.
- EC-4: `limit=0` — treated as `limit=1`, not as "return all". Returns exactly one event.
- EC-5: `limit=100` exactly — no capping needed; 100 is the maximum allowed value.
- EC-6: `page` is so large that `offset >= total` — returns `{ "events": [], "pagination": { "page": N, "limit": 50, "total": M, "hasMore": false } }`. Not a 404.
- EC-7: An event has `endedAt = null` and `durationMs = null` (in-flight command) — the event is returned with null fields; no filtering or special handling.
- EC-8: An event has `outcome = null` — returned as `null` in the API; displayed as "—" in UI.
- EC-9: `installId` belongs to the correct org but has zero events — returns empty results, not 404.
- EC-10: `from` is provided without `to` — valid; applies only the lower bound. Upper bound is unbounded.
- EC-11: `to` is provided without `from` — the server applies the default `from` of `now - 7 days`, then also applies the `to` upper bound. The result is a bounded window where `from` is the default.
- EC-12: `page=1&limit=50` and there are exactly 50 matching events — `hasMore` is `false`, `total` is 50.
- EC-13: `page=1&limit=50` and there are exactly 51 matching events — `hasMore` is `true`, `total` is 51.
- EC-14: `computerName` or `gitUserId` on the joined install row is unexpectedly empty string — return as-is; do not substitute. (This would indicate bad data, not an API concern.)
- EC-15: Multiple filters applied simultaneously (e.g., `command + outcome + from + to + installId`) — all conditions combined with AND; query remains parameterised.

---

## Dependencies

- **Depends on**: `auth` spec (provides `requireCtoSession`, `lib/db.ts`), `dashboard-core` spec (provides `(dashboard)/layout.tsx` session gate), `event-ingestion` spec (populates the `events` table this feature reads)
- **Depended on by**: none at MVP
- **Group**: prime-factory dashboard

The `installId` filter dropdown consumes `GET /api/v1/dashboard/installs` — that endpoint is part of the dashboard-core or installs spec and must exist before the filter dropdown can be populated. The Event Explorer page degrades gracefully if that endpoint is unavailable (empty dropdown, no filter applied).

---

## Implementation Size Estimate

- **Scope size**: medium (3 files: `app/api/v1/dashboard/events/route.ts`, `app/(dashboard)/events/page.tsx`, and an inline or co-located `EventFilters` client component)
- **Suggested parallel tracks**:
  - Track A: `app/api/v1/dashboard/events/route.ts` — GET handler, Drizzle query builder, pagination, all validation, response shape, Cache-Control header. No UI dependency.
  - Track B: `app/(dashboard)/events/page.tsx` + `EventFilters` client component — page layout, filter bar, paginated table, URL search param read/write, debounce, empty state, duration formatting, outcome display. Consumes Track A's response shape (can be developed against mock data simultaneously).
  - Zero file overlap between tracks.

---

## Implementation Notes

- Use `getDb` from `db/client.ts` via `lib/db.ts` (the single `getCloudflareContext()` call site).
- Use `requireCtoSession` from `lib/auth/requireCtoSession.ts` — call it before any D1 query.
- The Drizzle query must name columns explicitly in `.select({ ... })` to guarantee `promptText` is never fetched. Do not use a wildcard select.
- JOIN pattern: `db.select({ ...eventCols, computerName: installs.computerName, gitUserId: installs.gitUserId }).from(events).innerJoin(installs, eq(events.installId, installs.id)).where(and(eq(events.orgId, orgId), ...optionalConditions))`.
- Build the optional WHERE conditions as an array, then spread into `and(...conditions)`. Do not build raw SQL strings.
- `Promise.all([dataQuery, countQuery])` — the count query uses `db.select({ count: sql<number>\`count(*)\` }).from(events).innerJoin(...).where(sameConditions)`.
- `params` in Next.js 16 Route Handler context must be `await`ed before destructuring (see project profile note).
- `Cache-Control: no-store` must be set via `new Response(..., { headers: { 'Cache-Control': 'no-store' } })` or via `NextResponse` headers. Do not rely on Next.js defaults.
- For `durationMs` formatting in the UI: implement a pure `formatDuration(ms: number | null): string` utility. `null` → `"—"`. `< 1000` → `"< 1s"`. `< 60000` → `"${Math.round(ms/1000)}s"`. Otherwise `"${Math.floor(ms/60000)}m ${Math.round((ms%60000)/1000)}s"`.
- URL search params: use `useSearchParams()` in `<EventFilters>` and `router.replace()` / `router.push()` with updated params. Read params in the Server Component via `searchParams` prop (typed as `Promise<...>` in Next.js 16 — must be awaited).
- Debounce: implement with `useEffect` + `setTimeout`/`clearTimeout`. Do not import a debounce library.
- The `<EventFilters>` component lives in the same file as the page or in a co-located `_components/EventFilters.tsx`. Either is acceptable; keep it within the `events/` directory.

---

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (org scoping) | P-01, H-01 |
| FR-2 (multi-filter) | P-03, P-04, P-05, H-06, H-07 |
| FR-3 (from/to → started_at; default 7d) | P-02, P-06, H-08 |
| FR-4 (command enum validation) | P-07, H-09 |
| FR-5 (outcome enum validation) | P-08, H-10 |
| FR-6 (from > to → 400) | P-09 |
| FR-7 (cross-org installId → empty, not 403) | H-01 |
| FR-8 (pagination normalisation) | P-10, P-11, H-11, H-12 |
| FR-9 (pagination object) | P-01, P-10 |
| FR-10 (parallel queries) | H-13 |
| FR-11 (promptText excluded) | P-01, H-14 |
| FR-12 (URL-persistent filters) | P-12 |
| FR-13 (installId dropdown) | P-13 |
| FR-14 (empty state message) | P-14 |
| FR-15 (durationMs human-readable) | P-15 |
| FR-16 (outcome null → "—") | P-16 |
| FR-17 (Cache-Control: no-store) | H-15 |
| FR-18 (ISO 8601 UTC in API, local in UI) | H-16 |
| BR-1 (org_id always first) | P-01, H-01 |
| BR-2 (default 7d from) | P-02, H-08 |
| BR-3 (limit cap at 100) | P-11, H-12 |
| BR-4 (page/limit <= 0 normalised) | H-11 |
| BR-5 (from > to → 400 not empty) | P-09 |
| BR-6 (cross-org installId → empty) | H-01 |
| BR-7 (promptText excluded at SELECT) | H-14 |
| BR-8 (computerName/gitUserId via JOIN) | P-01, H-17 |
| EC-1 (both queries fail) | H-13 |
| EC-2 (one query fails) | H-13 |
| EC-3 (from = to same instant) | H-18 |
| EC-4 (limit=0 → 1) | H-11 |
| EC-5 (limit=100 exact) | H-12 |
| EC-6 (page beyond total) | H-19 |
| EC-7 (null endedAt/durationMs) | P-17 |
| EC-8 (outcome=null) | P-16 |
| EC-9 (installId with zero events) | H-20 |
| EC-10 (from without to) | P-06 |
| EC-11 (to without from uses default from) | H-08 |
| EC-12 (exactly 50 events, hasMore=false) | H-21 |
| EC-13 (exactly 51 events, hasMore=true) | H-21 |
| EC-14 (empty computerName passthrough) | H-17 |
| EC-15 (all filters combined) | H-06 |
| Error: no session / expired session (→ 401) | H-23 |
| Error: invalid date format for from/to (→ 400) | H-25 |
| Error: D1 query failure (→ 500) | H-13 |
| NFR-5 (debounce 300ms) | H-24 |
| Cross-feature: installs endpoint degradation | H-22 |
