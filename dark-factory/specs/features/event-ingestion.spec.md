# Feature: event-ingestion

## Context

The Dark Factory CLI (`df-*` commands) runs on developer machines and must silently record
telemetry for every command invocation. CTOs use these events to observe pipeline health
across all their developers' installs. Without a reliable ingest endpoint, no data reaches
the dashboard.

The ingest endpoint is the single write path for all CLI telemetry. It must:
- authenticate the caller via API key before touching any body data
- resolve install identity from the API key, never from the request body
- persist the event row to D1
- respond quickly so the CLI's fire-and-forget call path is not a bottleneck

Volume is well under the D1 free-tier write ceiling (< 100 events/dev/day against 100K/day
limit), so batch ingest and complex backpressure are deferred to a future phase.

---

## Scope

### In Scope (this spec)

- `POST /api/v1/events` — single-event ingest from the CLI
- API key authentication via `requireApiKey(request)` (provided by auth spec)
- Full request body validation (required fields, enum values, timestamp constraints)
- Server-side `promptText` truncation to 64 KB before insert
- Server-generated `id` (UUID) and `createdAt` (now)
- `installId` and `orgId` sourced exclusively from the resolved API key
- `201 { ok: true, id: string }` on success
- `{ error: string }` error shape on all failures; D1 errors never leaked

### Out of Scope (explicitly deferred)

- Batch event ingest — not needed at current volume; add when volume grows
- Rate limiting — no D1-based counter; Cloudflare paid rate-limiting API is the right
  tool when this becomes necessary (see project profile section 9)
- Duplicate detection / idempotency keys — acceptable at MVP; CLI already fire-and-forget
- `GET /api/v1/events/:id` — no single-event detail view needed
- Dashboard read of events — separate spec (`dashboard-events`)
- `lastSeenAt` update on `installs` — handled inside `requireApiKey` as a side-effect;
  this route does not touch the `installs` table directly

### Scaling Path

If event volume grows:
1. Add a batch endpoint `POST /api/v1/events/batch` accepting up to N events per call.
2. If D1 write limits become a concern, front the endpoint with a Cloudflare Queue (Workers
   paid tier) and write to D1 from a Queue consumer — zero change to the route contract.
3. The `sessionId` field already exists on the schema to correlate events across a pipeline
   run; future analytics can group by `sessionId` without a schema migration.

---

## Requirements

### Functional

- FR-1: The route MUST call `requireApiKey(request)` as the first operation. If it returns
  a non-2xx response, that response is forwarded immediately; no body is parsed.
- FR-2: `installId` and `orgId` MUST be taken from the `requireApiKey` return value only.
  Any `installId` or `orgId` fields present in the request body MUST be silently ignored.
- FR-3: The route MUST parse the request body as JSON. If parsing fails, respond `400
  { error: "Invalid JSON" }`.
- FR-4: `command` is required. It MUST be one of:
  `df-intake`, `df-debug`, `df-orchestrate`, `df-onboard`, `df-cleanup`.
  Missing or non-enum values → `400 { error: "Invalid command" }`.
  Empty string → `400 { error: "Invalid command" }`.
- FR-5: `startedAt` is required. It MUST be a string that parses to a valid Date via
  `new Date(startedAt)`. Invalid → `400 { error: "Invalid startedAt" }`.
- FR-6: `startedAt` MUST NOT be more than 1 hour in the future relative to server time.
  Far-future timestamps → `400 { error: "startedAt is too far in the future" }`.
- FR-7: If `endedAt` is present it MUST be a valid ISO 8601 string AND its parsed value
  MUST be >= parsed `startedAt`. Violation → `400 { error: "endedAt must be >= startedAt" }`.
- FR-8: If `durationMs` is present it MUST be a number >= 0.
  Violation → `400 { error: "Invalid durationMs" }`.
- FR-9: If `roundCount` is present it MUST be an integer >= 0.
  Violation → `400 { error: "Invalid roundCount" }`.
- FR-10: If `outcome` is present it MUST be one of: `success`, `failed`, `blocked`,
  `abandoned`. Violation → `400 { error: "Invalid outcome" }`.
- FR-11: If `promptText` is present and its UTF-8 byte length exceeds 64 KB (65,536 bytes),
  it MUST be silently truncated to exactly 64 KB before insert. No error is returned;
  the response `id` reflects the stored (truncated) row.
- FR-12: The route generates `id = crypto.randomUUID()` and `createdAt = new Date()` on
  the server. These fields are never accepted from the request body.
- FR-13: Timestamps are stored as Unix seconds integers in D1 (Drizzle `mode: "timestamp"`
  columns). The route converts the ISO 8601 string to a `Date` object; Drizzle handles the
  rest.
- FR-14: On successful insert, respond `201 { ok: true, id: "<uuid>" }`.
- FR-15: On any D1 error, respond `500 { error: "Internal server error" }`. Raw D1
  error messages MUST NOT appear in the response body.
- FR-16: The route handler MUST export only a `POST` function. All other HTTP methods on
  this path return Next.js's default `405 Method Not Allowed`.

### Non-Functional

- NFR-1: Response time — the D1 insert must complete before the response is sent. The CLI
  is fire-and-forget but still reads the HTTP status to decide whether to log a warning.
  Target p99 < 500 ms under normal D1 conditions.
- NFR-2: No Node.js APIs. Use `globalThis.crypto.randomUUID()` (not `require('crypto')`).
  This is a Cloudflare Workers runtime.
- NFR-3: TypeScript strict mode. No `any` without an explanatory comment.
- NFR-4: `npm run lint` must pass on the output file.

---

## Data Model

No schema changes. The `events` table already has all required columns (see `db/schema.ts`):

```
events.id           text PK         — server-generated UUID
events.installId    text NOT NULL   — from requireApiKey
events.orgId        text NOT NULL   — from requireApiKey
events.command      text NOT NULL   — enum validated
events.subcommand   text            — optional free text
events.startedAt    integer ts      — parsed from ISO 8601 string, stored as Unix seconds
events.endedAt      integer ts      — optional, >= startedAt
events.durationMs   real            — optional, >= 0
events.outcome      text enum       — optional
events.featureName  text            — optional free text
events.roundCount   integer         — optional, >= 0
events.promptText   text            — optional, truncated to 64 KB before insert
events.sessionId    text            — optional free text
events.createdAt    integer ts      — server-generated now
```

---

## Migration & Deployment

N/A — no existing data affected. The `events` table already exists in the scaffold schema.
This route creates new rows only; it does not alter the table shape, any existing data, or
any cached values. No migration script is needed.

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/events | Ingest a single telemetry event | CLI API key (`Authorization: Bearer`) |

### Request body

```json
{
  "command":     "df-intake",           // required, enum
  "startedAt":  "2026-04-06T14:30:00.000Z", // required, ISO 8601 UTC
  "subcommand":  "--group",             // optional
  "endedAt":    "2026-04-06T14:30:45.000Z", // optional, >= startedAt
  "durationMs":  45000,                 // optional, number >= 0
  "outcome":    "success",              // optional, enum
  "featureName": "checkout-flow",       // optional
  "roundCount":  3,                     // optional, integer >= 0
  "promptText":  "...",                 // optional, truncated to 64 KB
  "sessionId":  "abc-123"              // optional
}
```

### Response — success

```
HTTP 201
{ "ok": true, "id": "550e8400-e29b-41d4-a716-446655440000" }
```

### Response — error

```
HTTP 400 | 401 | 500
{ "error": "<human-readable message>" }
```

---

## Business Rules

- BR-1: `installId` and `orgId` come from the API key lookup, never from the caller.
  A CLI bug or malicious caller that sends these fields in the body must not be able to
  attribute events to a different install or org.
- BR-2: `command` must match the known enum. Unknown commands indicate a stale or rogue CLI
  version. Rejecting them keeps dashboard data clean and prevents garbage from polluting
  CTO-facing charts.
- BR-3: `startedAt` more than 1 hour in the future is rejected. Clocks can drift, but a
  future timestamp beyond 1 hour indicates a misconfigured machine or a test sending bad
  data. Persisting it would corrupt time-series charts.
- BR-4: `endedAt` < `startedAt` is physically impossible and indicates bad client data.
  Persisting it would produce negative durations in dashboard analytics.
- BR-5: `promptText` truncation is silent — the CLI does not need to know the server
  trimmed the field. The event is still recorded; only the tail of the prompt is lost.
  This is preferable to a 400 that causes the CLI to log a noisy error for every large
  prompt.
- BR-6: Duplicate events are acceptable at MVP. The CLI does not send idempotency keys;
  the server does not deduplicate. Each call creates a new row with a new UUID.

---

## Error Handling

| Scenario | HTTP | Response body | Side effects |
|---|---|---|---|
| Missing or invalid `Authorization` header | 401 | `{ error: "..." }` (from requireApiKey) | None |
| API key not found in installs | 401 | `{ error: "..." }` (from requireApiKey) | None |
| Body is not valid JSON | 400 | `{ error: "Invalid JSON" }` | None |
| `command` missing | 400 | `{ error: "Invalid command" }` | None |
| `command` is empty string | 400 | `{ error: "Invalid command" }` | None |
| `command` not in enum | 400 | `{ error: "Invalid command" }` | None |
| `startedAt` missing | 400 | `{ error: "Invalid startedAt" }` | None |
| `startedAt` not a valid date string | 400 | `{ error: "Invalid startedAt" }` | None |
| `startedAt` > now + 1 hour | 400 | `{ error: "startedAt is too far in the future" }` | None |
| `endedAt` present but invalid date string | 400 | `{ error: "Invalid endedAt" }` | None |
| `endedAt` < `startedAt` | 400 | `{ error: "endedAt must be >= startedAt" }` | None |
| `durationMs` present but < 0 | 400 | `{ error: "Invalid durationMs" }` | None |
| `durationMs` present but not a number | 400 | `{ error: "Invalid durationMs" }` | None |
| `roundCount` present but < 0 | 400 | `{ error: "Invalid roundCount" }` | None |
| `roundCount` present but not an integer | 400 | `{ error: "Invalid roundCount" }` | None |
| `outcome` not in enum | 400 | `{ error: "Invalid outcome" }` | None |
| D1 insert fails | 500 | `{ error: "Internal server error" }` | None; raw D1 error not surfaced |

---

## Acceptance Criteria

- [ ] AC-1: `POST /api/v1/events` with a valid API key and valid minimal body (`command` +
  `startedAt`) returns `201 { ok: true, id: "<uuid>" }` and a row exists in D1 with
  `installId` and `orgId` matching the key's resolved values.
- [ ] AC-2: The body fields `installId` and `orgId`, if sent, are ignored — the stored row
  reflects the API key's resolved values, not the body values.
- [ ] AC-3: A request with an unknown or missing `command` returns `400`.
- [ ] AC-4: A request with an invalid or missing `startedAt` returns `400`.
- [ ] AC-5: A request with `startedAt` more than 1 hour in the future returns `400`.
- [ ] AC-6: A request with `endedAt` < `startedAt` returns `400`.
- [ ] AC-7: A request with `durationMs: -1` returns `400`.
- [ ] AC-8: A request with `roundCount: -1` returns `400`.
- [ ] AC-9: A request with an invalid `outcome` returns `400`.
- [ ] AC-10: `promptText` exceeding 64 KB is stored truncated; response is still `201`.
- [ ] AC-11: A request with no `Authorization` header returns `401`.
- [ ] AC-12: A D1 failure returns `500 { error: "Internal server error" }` with no raw
  D1 error text in the body.
- [ ] AC-13: `id` in the response matches the UUID stored in the D1 row.
- [ ] AC-14: `createdAt` on the stored row is set to server time, not any client-supplied value.

---

## Edge Cases

- EC-1: `startedAt` exactly at now + 1 hour boundary — accepted (rule is strictly > 1 hour).
- EC-2: `endedAt` exactly equal to `startedAt` — accepted (0-duration event is valid).
- EC-3: `durationMs: 0` — accepted (zero duration is valid).
- EC-4: `roundCount: 0` — accepted (zero rounds is valid).
- EC-5: `promptText` UTF-8 byte length exactly 65,536 — stored as-is, no truncation needed.
- EC-6: `promptText` UTF-8 byte length 65,537 — truncated to 65,536 bytes before insert.
- EC-7: Body contains `installId` or `orgId` fields — silently ignored; row uses key-resolved
  values.
- EC-8: Body contains `id` or `createdAt` fields — silently ignored; server generates both.
- EC-9: `subcommand`, `featureName`, `sessionId` present as empty strings — stored as-is;
  no enum or length constraint on these fields.
- EC-10: `roundCount: 1.5` (non-integer float) — rejected with `400 { error: "Invalid roundCount" }`.
- EC-11: `durationMs` sent as a string (e.g. `"45000"`) — rejected with
  `400 { error: "Invalid durationMs" }` (type check required, not just coercion).
- EC-12: Request body is valid JSON but not an object (e.g. `null`, `[]`, `"string"`) —
  `400 { error: "Invalid JSON" }` or equivalent body-shape error.
- EC-13: `startedAt` exactly 1 hour and 1 second in the future — rejected.
- EC-14: `promptText` with multi-byte UTF-8 characters (e.g. emoji) — truncation is
  byte-aware; must not split a multi-byte character, OR may truncate mid-character so long
  as the stored value is a valid UTF-8 prefix (implementation may choose either; the key
  constraint is the stored byte length must not exceed 65,536).

---

## Dependencies

- **Depends on**: `auth` spec — must be complete before this route can be implemented.
  Specifically requires:
  - `lib/auth/requireApiKey.ts` — called as first operation; returns `{ installId, orgId }`
    or a `Response` with 401.
  - `lib/db.ts` — thin wrapper around `getCloudflareContext()` + `getDb(env.DB)`; used to
    obtain the Drizzle client inside the route handler.
- **Depended on by**: `dashboard-events` spec (reads from the `events` table this route
  populates).
- **Group**: core-telemetry-pipeline

---

## Implementation Size Estimate

- **Scope size**: small — 1 file (`app/api/v1/events/route.ts`)
- **Suggested parallel tracks**: 1 code-agent (single file, no parallelism warranted)

---

## Implementation Notes

- Call `requireApiKey(request)` first. If it returns a `Response`, return it immediately
  without parsing the body. Pattern:
  ```ts
  const authResult = await requireApiKey(request);
  if (authResult instanceof Response) return authResult;
  const { installId, orgId } = authResult;
  ```
- Parse body with `request.json()` inside a try/catch; return `400` on parse failure.
- Validate fields in order: `command` → `startedAt` → optional fields. Return on first
  failure (no field-accumulation error response needed at MVP).
- `startedAt` future check: `new Date(startedAt).getTime() > Date.now() + 60 * 60 * 1000`.
- `promptText` truncation: use `TextEncoder` / `TextDecoder` (available in V8/Workers
  runtime) to operate on bytes, not characters.
  ```ts
  const MAX = 65_536;
  if (promptText !== undefined) {
    const encoded = new TextEncoder().encode(promptText);
    if (encoded.length > MAX) {
      promptText = new TextDecoder().decode(encoded.slice(0, MAX));
    }
  }
  ```
- Insert via Drizzle:
  ```ts
  const db = await getDb(); // from lib/db.ts
  await db.insert(events).values({ id, installId, orgId, command, ..., createdAt: new Date() });
  ```
- Wrap the D1 insert in try/catch; catch returns `500 { error: "Internal server error" }`.
- Export only `POST`:
  ```ts
  export async function POST(request: Request) { ... }
  ```
- `crypto.randomUUID()` is available globally in the Cloudflare Workers runtime.

---

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | H-01, H-02 |
| FR-2 | P-03 |
| FR-3 | H-03 |
| FR-4 | H-04, H-05, H-06, H-07 |
| FR-5 | H-08, H-09 |
| FR-6 | H-10, H-11 |
| FR-7 | H-12, H-13, H-14 |
| FR-8 | H-15, H-16 |
| FR-9 | H-17, H-18 |
| FR-10 | H-19, H-27 |
| FR-11 | P-05, H-20 |
| FR-12 | P-03 |
| FR-13 | P-01 |
| FR-14 | P-01, P-02 |
| FR-15 | H-21 |
| FR-16 | H-22 |
| BR-1 | P-03 |
| BR-2 | H-04, H-05, H-06, H-07 |
| BR-3 | H-10, H-11, H-13 |
| BR-4 | H-12 |
| BR-5 | P-05, H-20 |
| BR-6 | P-04 |
| EC-1 | H-11 |
| EC-2 | H-14 |
| EC-3 | P-06 |
| EC-4 | P-07 |
| EC-5 | H-23 |
| EC-6 | H-20 |
| EC-7 | P-03 |
| EC-8 | H-24 |
| EC-9 | H-25 |
| EC-10 | H-18 |
| EC-11 | H-16 |
| EC-12 | H-26 |
| EC-13 | H-10 |
| EC-14 | H-20 |
| Cross-feature (dashboard-events) | H-28 |
