# Architect Review: event-ingestion

**Status: APPROVED WITH NOTES**

## Review Summary

The spec is well-defined and maps cleanly onto the existing codebase patterns. The auth
infrastructure (`requireApiKey`) and schema (`events` table) are already in place.

---

## Key Decisions

### KD-1: `requireApiKey` return shape
`requireApiKey` returns `{ ok: boolean; context?: ApiKeyContext; response?: NextResponse }`
(not `instanceof Response`). The spec's pseudocode is slightly simplified. The correct
pattern (matching actual implementation in `lib/auth/requireApiKey.ts`) is:

```ts
const result = await requireApiKey(request);
if (!result.ok) return result.response;
const { installId, orgId } = result.context;
```

### KD-2: Security — orgId/installId from API key only
`orgId` and `installId` MUST be destructured exclusively from `result.context`. Any
fields of the same name present in the parsed request body MUST be silently discarded.
Never pass body fields into the Drizzle insert for these columns.

### KD-3: `command` and `outcome` enum validation
Use `const COMMANDS = ["df-intake", "df-debug", "df-orchestrate", "df-onboard", "df-cleanup"] as const`
and `const OUTCOMES = ["success", "failed", "blocked", "abandoned"] as const` with
`Array.prototype.includes` for the guard. Empty string must fail the command check.

### KD-4: Timestamp parsing
- `startedAt`: `new Date(startedAt)` — check `isNaN(date.getTime())` for validity.
- Future check: `startedAt.getTime() > Date.now() + 60 * 60 * 1000` — strictly greater than.
- `endedAt`: same validity check, then `endedAt.getTime() >= startedAt.getTime()`.
- Store as `Date` objects — Drizzle `mode: "timestamp"` handles Unix-second conversion.

### KD-5: `promptText` byte-aware truncation at 64 KB
Use `TextEncoder` / `TextDecoder` (Web API, available in Cloudflare Workers):

```ts
const MAX_BYTES = 65_536;
const encoded = new TextEncoder().encode(promptText);
if (encoded.length > MAX_BYTES) {
  promptText = new TextDecoder().decode(encoded.slice(0, MAX_BYTES));
}
```

Per EC-14, truncating mid-character is acceptable as long as the stored byte length
does not exceed 65,536. `TextDecoder` will replace the broken tail with the replacement
character — acceptable per spec.

### KD-6: `durationMs` validation
Must check `typeof durationMs !== "number"` first, then `!Number.isFinite(durationMs)`,
then `durationMs < 0`. Strings sent as `"45000"` must fail at the type check.

### KD-7: `roundCount` validation
Must check `typeof roundCount !== "number"`, then `!Number.isInteger(roundCount)`,
then `roundCount < 0`. Non-integer floats (e.g. `1.5`) must fail at `Number.isInteger`.

### KD-8: D1 error leakage prevention
Wrap only the `db.insert(events).values(...)` call in a try/catch. On any error,
return `500 { error: "Internal server error" }` without surfacing the raw error message.

### KD-9: Server-generated fields
- `id`: `crypto.randomUUID()` — globally available in Cloudflare Workers runtime (NFR-2).
- `createdAt`: `new Date()` — passed as `Date` object to Drizzle.

### KD-10: Body-shape guard
After `request.json()` succeeds, verify the result is a plain non-null object
(`typeof body === "object" && body !== null && !Array.isArray(body)`).
If not, return `400 { error: "Invalid JSON" }` per EC-12.

### KD-11: Export only `POST`
The file must export only `export async function POST(...)`. No other HTTP method
exports. Next.js App Router returns 405 for unhandled methods by default.

### KD-12: TypeScript
Use `unknown` for the raw body type and narrow with explicit type guards. Avoid `any`.
Use `eslint-disable` only for the `request.json()` assignment as done in `installs/route.ts`.

---

## Remaining Notes

- No migration needed — `events` table already exists in `db/schema.ts`.
- The `getDatabase()` import comes from `@/lib/db` (not a direct Drizzle call).
- Import `events` table from `@/db/schema`.
- `NextRequest` and `NextResponse` are from `next/server`.
- Response for success: `NextResponse.json({ ok: true, id }, { status: 201 })`.
- All error responses: `NextResponse.json({ error: "..." }, { status: 4xx|5xx })`.
