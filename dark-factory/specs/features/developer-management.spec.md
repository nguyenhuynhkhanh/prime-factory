# Feature: Developer Management (Installs Page)

## Context

CTOs need visibility into which developer machines have registered with their organisation, how
recently those machines have been active, and how to onboard new developers. Today this information
lives only in D1 — there is no UI surface for it.

The primary action the CTO takes here is: "Who is connected? Are they active? How do I add more
people?" The secondary action is copying a shareable invite link to send to new developers.

Note: because a single developer can register multiple machines, the correct mental model is
**registered machines**, not "registered developers". The page heading reflects this.

---

## Scope

### In Scope (this spec)

- `GET /api/v1/dashboard/installs` — session-cookie-gated endpoint that returns the install list
  with aggregated event stats; explicit column SELECT (no `apiKey`, no `hmac`)
- `app/(dashboard)/installs/page.tsx` — "Registered Machines" page that:
  - Shows a prominent "Copy invite link" button (org-scoped URL)
  - Renders a flat table of installs ordered by `lastSeenAt DESC NULLS LAST`
  - Shows an Active / Inactive badge per row based on a 30-day `lastSeenAt` threshold
  - Handles `null` `lastSeenAt` gracefully ("Never")
  - Truncates long `computerName` / `gitUserId` values with a tooltip for the full text
  - Shows an empty state ("No developers registered yet. Share your invite link to get started.")
  - LIMIT 200 safety cap (server-enforced)

### Out of Scope (explicitly deferred)

- Revoking or deleting an install (future feature — `DELETE /api/v1/dashboard/installs/:id`)
- Filtering or searching the install list
- Pagination (deferred — org scale is small at MVP; safety cap is sufficient)
- Per-install event drill-down from this page (belongs to the events feature)
- Editing `computerName` / `gitUserId` labels
- Admin-level installs view across multiple orgs

### Scaling Path

If the org grows beyond ~200 machines, the LIMIT 200 cap will silently truncate. At that point,
add cursor-based pagination behind an `?after=` query param. The server query shape (ORDER BY
`lastSeenAt DESC NULLS LAST`) is already pagination-friendly. The UI layer can remain the same
by incrementally loading rows.

---

## Requirements

### Functional

- FR-1: The API must return only installs belonging to the authenticated CTO's `orgId`. No
  cross-org data must ever be returned. — enforced by `WHERE orgId = session.orgId` in every query.
- FR-2: The API response must never include `apiKey` or `hmac` fields. — enforced by explicit
  column enumeration in the SELECT; `SELECT *` is prohibited.
- FR-3: Each install row must include aggregated event stats: total `eventCount` and `lastEventAt`.
  These are derived from the `events` table via a LEFT JOIN so installs with zero events still
  appear. — `COUNT(events.id)` and `MAX(events.createdAt)` grouped by `installs.id`.
- FR-4: Results are ordered by `lastSeenAt DESC NULLS LAST` so the most recently active machines
  appear first and machines that have never been seen appear at the bottom.
- FR-5: A LIMIT 200 safety cap is applied server-side on every query regardless of request
  parameters. No query param can override or remove this cap.
- FR-6: The page must display a "Copy invite link" button above the install table. The invite URL
  is org-scoped (contains the `orgId`) and is suitable for sharing with a developer who will run
  `df-onboard`.
- FR-7: Each install row must show an Active / Inactive badge. Active = `lastSeenAt` is within
  the last 30 calendar days relative to the server response time. Inactive = `lastSeenAt` is null
  or older than 30 days.
- FR-8: `lastSeenAt = null` must render as "Never" in the UI. This must not throw or render a
  raw `null` / `undefined`.
- FR-9: `computerName` and `gitUserId` values must be truncated in the table if they exceed a
  reasonable display width. The full value must be accessible via a tooltip on hover (CSS or
  `title` attribute) so the CTO can read it without truncation.
- FR-10: When the install list is empty (zero rows), the page must show an empty-state message:
  "No developers registered yet. Share your invite link to get started."
- FR-11: The page heading is "Registered Machines", not "Developers".

### Non-Functional

- NFR-1: The API endpoint must respond in under 500 ms for up to 200 rows on Cloudflare D1 free
  tier. The LEFT JOIN query uses the existing `events(install_id)` index for GROUP BY performance.
- NFR-2: The page must not expose security-sensitive data (`apiKey`, `hmac`) even if D1 returns
  extra columns unexpectedly — use explicit destructuring in the API handler to allow-list fields
  before serialising to JSON.
- NFR-3: The API must return a consistent `{ error: string }` JSON body on all error paths with
  an appropriate HTTP status. Raw D1 errors and stack traces must never be sent to the client.

---

## Data Model

No new tables or columns are required. This feature reads from existing tables:

- `installs` — `id`, `orgId`, `computerName`, `gitUserId`, `createdAt`, `lastSeenAt`
- `events` — `installId`, `id` (for COUNT), `createdAt` (for MAX → `lastEventAt`)

Explicit columns selected from `installs`:

```sql
installs.id,
installs.computer_name,
installs.git_user_id,
installs.created_at,
installs.last_seen_at
```

`apiKey` and `hmac` columns are never referenced in any SELECT for this feature.

---

## Migration & Deployment

N/A — no existing data affected. This feature adds a new read-only API endpoint and a new UI page.
It does not modify any schema, add columns, rename fields, or change the shape of any data already
written to D1. No migration plan is needed.

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/dashboard/installs | List all installs for the authenticated CTO's org with event stats | Session cookie (CTO) |

### GET /api/v1/dashboard/installs

**Authentication:** `requireCtoSession` — reads `session` cookie, validates against `sessions`
table (row must exist and `expiresAt > now`), returns `{ userId, orgId }`. Returns `401` if
missing or expired.

**Query parameters:** none at MVP.

**Success response — 200:**

```json
{
  "installs": [
    {
      "id": "uuid-string",
      "computerName": "MacBook-Pro-M3",
      "gitUserId": "alice",
      "createdAt": "2026-01-15T09:00:00.000Z",
      "lastSeenAt": "2026-04-01T14:30:00.000Z",
      "eventCount": 42,
      "lastEventAt": "2026-04-01T14:29:55.000Z"
    },
    {
      "id": "uuid-string-2",
      "computerName": "devbox-ubuntu",
      "gitUserId": "bob@company.com",
      "createdAt": "2026-02-10T11:00:00.000Z",
      "lastSeenAt": null,
      "eventCount": 0,
      "lastEventAt": null
    }
  ]
}
```

Field types:
- `id`: string (UUID)
- `computerName`: string
- `gitUserId`: string (may look like an email — render safely, do not attempt to parse or mailto-link it)
- `createdAt`: ISO 8601 UTC string — derived from `integer` D1 column via Drizzle `mode: "timestamp"` (multiply epoch seconds × 1000, `.toISOString()`)
- `lastSeenAt`: ISO 8601 UTC string or `null`
- `eventCount`: integer ≥ 0
- `lastEventAt`: ISO 8601 UTC string or `null`

**SQL query (canonical form):**

```sql
SELECT
  installs.id,
  installs.computer_name,
  installs.git_user_id,
  installs.created_at,
  installs.last_seen_at,
  COUNT(events.id)       AS event_count,
  MAX(events.created_at) AS last_event_at
FROM installs
LEFT JOIN events ON events.install_id = installs.id
WHERE installs.org_id = :orgId
GROUP BY installs.id
ORDER BY installs.last_seen_at DESC NULLS LAST
LIMIT 200
```

**Error responses:**

| Condition | Status | Body |
|-----------|--------|------|
| Missing or expired session cookie | 401 | `{ "error": "Unauthorized" }` |
| D1 query failure | 500 | `{ "error": "Internal server error" }` |

---

## Business Rules

- BR-1: All queries are scoped to `orgId` from the authenticated session. A CTO can only see
  installs belonging to their own org. — Prevents cross-org data leakage regardless of install IDs
  an attacker might guess.
- BR-2: `apiKey` and `hmac` are never selected or returned. — These columns are credentials; their
  exposure would allow impersonation of a developer install. Use an explicit column list, not
  `SELECT *`.
- BR-3: Active threshold is exactly 30 days (2,592,000 seconds) before the response is generated.
  The threshold is evaluated server-side in the UI component by comparing `lastSeenAt` to
  `Date.now() - 30 * 24 * 60 * 60 * 1000`. The API returns the raw timestamp — the badge
  computation is a display concern.
- BR-4: An install with `lastSeenAt = null` is always Inactive. — It has never sent a telemetry
  event and has not been seen by `requireApiKey` middleware.
- BR-5: An install row always appears in the list even if it has zero events. — The LEFT JOIN
  ensures this. An install registered via `df-onboard` but never used still shows with
  `eventCount: 0` and `lastEventAt: null`.
- BR-6: The invite link is formed from the org's `orgId`. The exact URL format is:
  `https://<app-domain>/invite/<orgId>`. The CTO's `orgId` is available from the session;
  the page does not need a separate API call to fetch it.
- BR-7: The LIMIT 200 cap is non-negotiable and cannot be removed or overridden by any client
  parameter. If the org ever has more than 200 installs, the oldest (by `lastSeenAt`) are silently
  omitted. This is a known MVP limitation and must be documented in the UI when count = 200 (a
  small advisory note: "Showing the 200 most recently active machines").

---

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| No session cookie sent | 401 `{ "error": "Unauthorized" }` | None |
| Session cookie present but row not in D1 (expired or deleted) | 401 `{ "error": "Unauthorized" }` | None |
| D1 unavailable / timeout | 500 `{ "error": "Internal server error" }` | None; D1 error is logged server-side, not surfaced to client |
| Session valid but `orgId` resolves to an org with 0 installs | 200 `{ "installs": [] }` | None |
| Result set exactly 200 rows (cap hit) | 200 with 200-row array; UI shows advisory note | None |

---

## Acceptance Criteria

- [ ] AC-1: `GET /api/v1/dashboard/installs` with a valid CTO session returns `{ "installs": [...] }` containing only installs for that CTO's org.
- [ ] AC-2: The response never includes `apiKey` or `hmac` at any level of nesting.
- [ ] AC-3: Installs with zero events appear in the list with `eventCount: 0` and `lastEventAt: null`.
- [ ] AC-4: The result is ordered most-recently-active first; `null` `lastSeenAt` rows appear last.
- [ ] AC-5: The endpoint returns 401 when called without a valid session cookie.
- [ ] AC-6: The page heading is "Registered Machines".
- [ ] AC-7: The page shows a "Copy invite link" button above the table.
- [ ] AC-8: The invite link button copies the org-scoped URL to the clipboard (or falls back to displaying it) when clicked.
- [ ] AC-9: A row where `lastSeenAt` is within 30 days shows a green "Active" badge; all others show a grey "Inactive" badge.
- [ ] AC-10: `lastSeenAt: null` renders as "Never" — no crash, no `null` string, no empty cell.
- [ ] AC-11: `computerName` and `gitUserId` values longer than the column display width are truncated with a tooltip exposing the full value.
- [ ] AC-12: Zero installs renders the empty state message: "No developers registered yet. Share your invite link to get started."
- [ ] AC-13: Server enforces LIMIT 200; exactly-200-row result shows the advisory note.
- [ ] AC-14: A CTO from org A cannot see installs from org B (cross-org isolation).

---

## Edge Cases

- EC-1: `gitUserId` contains an email address (e.g., `alice@company.com`). Must render as plain text — do not auto-link with `mailto:` or attempt to parse as a URL.
- EC-2: `computerName` is the maximum possible length (arbitrary CLI string). Must be truncated, not overflow the table layout.
- EC-3: `lastSeenAt` is exactly 30 days ago to the millisecond. The boundary is inclusive — a machine last seen exactly 30 days ago is Inactive (threshold: `lastSeenAt < now - 30d`). This avoids a flip-flop exactly at the boundary on repeated page loads.
- EC-4: Install exists in D1 but has never sent any events (`eventCount = 0`, `lastEventAt = null`). Must still render a row without crashing.
- EC-5: Exactly 200 installs returned (cap hit). Advisory note "Showing the 200 most recently active machines" must appear below the table or in the table header.
- EC-6: CTO's session is valid but their `orgId` has 0 installs. Page shows empty state, not an error.
- EC-7: `computerName` or `gitUserId` contains HTML special characters (e.g., `<script>`, `"`, `&`). React's default JSX rendering escapes these; no explicit sanitisation is required, but the values must not be rendered with `dangerouslySetInnerHTML`.
- EC-8: Two installs for the same `gitUserId` from different machines. Both appear as separate rows (this is correct — rows represent machines, not people).
- EC-9: `lastEventAt` is non-null but `lastSeenAt` is null. This can occur if `lastSeenAt` was never updated (e.g., a bug in the auth middleware of a previous version). The row renders with "Never" for last seen and the actual `lastEventAt` value for last event — no crash.
- EC-10: API called with a valid session cookie via direct `fetch` (not browser navigation). Must return the same 200 response — no CSRF protection required on GET endpoints.

---

## Dependencies

Other modules this feature consumes (must be complete before implementation begins):

- **Depends on**: `auth` spec — provides `lib/auth/requireCtoSession.ts` and `lib/db.ts`
- **Depends on**: `dashboard-core` spec — provides `app/(dashboard)/layout.tsx` session gate
- **Depended on by**: none at this time (this is a standalone read-only page)
- **Group**: dashboard features

Cross-feature data impact:

- This feature reads `installs` and `events` but does not write to either. It cannot break
  `event-ingestion` or `auth` because it holds no write path.
- The `events(install_id)` index used by the LEFT JOIN is relied upon by the `dashboard/events`
  and `dashboard/stats` routes as well. This feature does not modify that index.
- `requireCtoSession` is called here the same way all dashboard routes call it. Any change to
  that helper affects all dashboard routes equally.

---

## Implementation Size Estimate

- **Scope size**: small (2 files)
- **Suggested parallel tracks**: single track
  - Track 1: `app/api/v1/dashboard/installs/route.ts` + `app/(dashboard)/installs/page.tsx`
  - Both files are in this spec; they have no overlap with other specs in progress.

---

## Implementation Notes

- Access D1 via `lib/db.ts` (calls `getCloudflareContext().env.DB` → `getDb(env.DB)`). Do not
  call `getCloudflareContext()` directly inside the route file.
- Use Drizzle's query builder or raw `db.run()` / `db.all()` with the SQL shown in the API
  section. The LEFT JOIN + GROUP BY is cleaner as a raw SQL call than as a Drizzle relational
  query.
- Timestamp columns in D1 are stored as Unix epoch integers. Drizzle `mode: "timestamp"` returns
  JavaScript `Date` objects. Call `.toISOString()` to serialise to ISO 8601. Handle `null`
  gracefully: `value ? value.toISOString() : null`.
- `eventCount` from `COUNT(events.id)` will be a number in D1 results. Coerce to `Number(row.eventCount)` to ensure it is not a string in the serialised JSON.
- In `page.tsx`, `orgId` is available from the session (the layout already validates the session
  and can pass it via a Server Component prop or the page can call `requireCtoSession` directly).
  Follow whatever pattern `dashboard-core` establishes for passing session data to child pages.
- The "Copy invite link" button should use the `navigator.clipboard.writeText()` API. Add a
  `'use client'` directive only to the button sub-component if the rest of the page is a Server
  Component. A simple fallback: if `navigator.clipboard` is unavailable (non-HTTPS or old
  browser), show a read-only `<input>` with the URL selected.
- Truncation: use Tailwind's `truncate` utility class (`overflow-hidden text-ellipsis
  whitespace-nowrap`) on the cell, and set the HTML `title` attribute to the full value. This
  is accessible and requires no JavaScript.
- Active/Inactive badge: compute in the component with
  `const isActive = lastSeenAt !== null && Date.now() - new Date(lastSeenAt).getTime() < 30 * 24 * 60 * 60 * 1000`.
  Render `<span className="...green...">Active</span>` or `<span className="...grey...">Inactive</span>`.
  Do not do this computation in the API layer.

---

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 (org-scoped query) | P-01, H-01 |
| FR-2 (no apiKey/hmac) | P-02, H-02 |
| FR-3 (LEFT JOIN event stats) | P-03, P-04 |
| FR-4 (ORDER BY lastSeenAt DESC NULLS LAST) | P-05, H-03 |
| FR-5 (LIMIT 200) | H-04 |
| FR-6 (invite link button) | P-06 |
| FR-7 (Active/Inactive badge) | P-07, P-08, H-05 |
| FR-8 (null lastSeenAt → "Never") | P-04, H-06 |
| FR-9 (truncation + tooltip) | H-07 |
| FR-10 (empty state) | P-09 |
| FR-11 (page heading) | P-01 |
| BR-1 (org isolation) | H-01 |
| BR-3 (30-day threshold boundary) | H-05 |
| BR-4 (null = always inactive) | P-08 |
| BR-5 (zero-event install appears) | P-04 |
| BR-6 (invite link format) | P-06 |
| BR-7 (200-cap advisory note) | H-04 |
| EC-1 (gitUserId as email) | H-08 |
| EC-2 (max-length computerName) | H-07 |
| EC-3 (exactly 30-day boundary) | H-05 |
| EC-4 (zero events, no crash) | P-04 |
| EC-5 (exactly 200 rows) | H-04 |
| EC-6 (0 installs → empty state) | P-09 |
| EC-7 (HTML special characters) | H-09 |
| EC-8 (same gitUserId, two machines) | P-10 |
| EC-9 (lastEventAt non-null, lastSeenAt null) | H-06 |
| EC-10 (direct fetch GET) | P-01, P-02 |
