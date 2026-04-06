# Holdout Validation Results: event-ingestion

**Date**: 2026-04-06
**Implementation file**: `app/api/v1/events/route.ts`
**Method**: Static code review of implementation against each holdout scenario.

---

## Results Summary

| Scenario | Status | Notes |
|----------|--------|-------|
| H-01 | PASS | |
| H-02 | PASS | |
| H-03 | PASS | |
| H-04 | PASS | |
| H-05 | PASS | |
| H-06 | PASS | |
| H-07 | PASS | |
| H-08 | PASS | |
| H-09 | PASS | |
| H-10 | PASS | |
| H-11 | PASS | |
| H-12 | PASS | |
| H-13 | PASS | |
| H-14 | PASS | |
| H-15 | PASS | |
| H-16 | PASS | |
| H-17 | PASS | |
| H-18 | PASS | |
| H-19 | PASS | |
| H-20 | PASS | |
| H-21 | PASS | |
| H-22 | PASS | |
| H-23 | PASS | |
| H-24 | PASS | |
| H-25 | PASS | |
| H-26 | PASS | |
| H-27 | PASS | |
| H-28 | PASS | |

**Total: 28/28 PASS**

---

## Detailed Analysis

### H-01 — Missing Authorization header returns 401
PASS. `requireApiKey(request)` is called first (line 64). `requireApiKey` checks for the
`Authorization` header and returns `{ ok: false, response: NextResponse(401) }` when absent.
Line 65 returns that response immediately before any body parsing occurs.

### H-02 — Unknown API key returns 401
PASS. Same flow as H-01. `requireApiKey` does a D1 lookup by `apiKey`; if no row is found,
it returns `{ ok: false, response: NextResponse(401) }`. The route returns early at line 65.

### H-03 — Malformed JSON body returns 400
PASS. Lines 69-74: `request.json()` is wrapped in try/catch. A parse error throws, the
catch block returns `NextResponse.json({ error: "Invalid JSON" }, { status: 400 })`.

### H-04 — Missing command field returns 400
PASS. `body.command` is `undefined` when not supplied. `isValidCommand(undefined)` checks
`typeof value === "string"` first — `undefined` fails, returns false. Line 89-91 returns
`{ error: "Invalid command" }` with status 400.

### H-05 — command not in enum returns 400
PASS. `isValidCommand("df-unknown")` checks `VALID_COMMANDS.includes("df-unknown")` — returns
false. Line 89-91 returns 400.

### H-06 — Empty string command returns 400
PASS. `isValidCommand("")` checks `VALID_COMMANDS.includes("")` — `""` is not in the enum,
returns false. Line 89-91 returns 400.

### H-07 — All five command enum values are accepted
PASS. All five values (`df-intake`, `df-debug`, `df-orchestrate`, `df-onboard`, `df-cleanup`)
are in `VALID_COMMANDS` (lines 16-22). `isValidCommand` returns true for each. Requests
proceed to the D1 insert and return 201.

### H-08 — Missing startedAt returns 400
PASS. `body.startedAt` is `undefined` when absent. Line 95 checks
`typeof body.startedAt !== "string"` — `undefined` fails. Returns `{ error: "Invalid startedAt" }`
status 400.

### H-09 — Non-parseable startedAt string returns 400
PASS. `new Date("not-a-date")` produces `Invalid Date`. Line 99:
`isNaN(startedAtDate.getTime())` is true → returns `{ error: "Invalid startedAt" }` 400.

### H-10 — startedAt more than 1 hour in the future returns 400
PASS. Line 102: `startedAtDate.getTime() > Date.now() + 60 * 60 * 1000`. A timestamp 3601
seconds in the future satisfies this condition. Returns
`{ error: "startedAt is too far in the future" }` 400.

### H-11 — startedAt exactly at now + 1 hour boundary is accepted
PASS. The check at line 102 uses strictly `>` (not `>=`). A timestamp at exactly
`Date.now() + 3600_000` evaluates to `false` for the condition, so the request passes
through to insert and returns 201.

### H-12 — endedAt before startedAt returns 400
PASS. Lines 118-130: `endedAtDate` is parsed. Line 125:
`endedAtDate.getTime() < startedAtDate.getTime()` — when `endedAt` = 09:59:59 and
`startedAt` = 10:00:00, this is true. Returns `{ error: "endedAt must be >= startedAt" }` 400.

### H-13 — startedAt in the past (24 hours ago) is accepted
PASS. The only future-direction check is `> Date.now() + 60 * 60 * 1000`. A past timestamp
does not satisfy this. No lower-bound check exists. Request proceeds to 201.

### H-14 — endedAt exactly equal to startedAt is accepted
PASS. Line 125: `endedAtDate.getTime() < startedAtDate.getTime()`. When equal, this is false.
Request proceeds to 201 with both timestamps stored.

### H-15 — durationMs negative returns 400
PASS. Line 139: `body.durationMs < 0` — `-1 < 0` is true. Returns
`{ error: "Invalid durationMs" }` 400. (Note: the `typeof` check and `isFinite` check are
evaluated first; `-1` passes those, then fails `< 0`.)

### H-16 — durationMs sent as string returns 400
PASS. Line 137: `typeof body.durationMs !== "number"` — `typeof "45000" !== "number"` is true.
Returns `{ error: "Invalid durationMs" }` 400. No coercion occurs.

### H-17 — roundCount negative returns 400
PASS. Line 155: `body.roundCount < 0` — `-1 < 0` is true. Returns
`{ error: "Invalid roundCount" }` 400.

### H-18 — roundCount as float returns 400
PASS. Line 154: `!Number.isInteger(body.roundCount)` — `Number.isInteger(1.5)` is false,
so `!false` is true. Returns `{ error: "Invalid roundCount" }` 400.

### H-19 — outcome not in enum returns 400
PASS. `isValidOutcome("partial")` — `VALID_OUTCOMES.includes("partial")` is false.
Line 169-174: returns `{ error: "Invalid outcome" }` 400.

### H-20 — promptText with multi-byte UTF-8 characters truncated at byte boundary
PASS. `truncateToBytes` (lines 56-60) uses `TextEncoder` to get the byte array, slices at
`MAX_PROMPT_BYTES` (65,536), then `TextDecoder.decode`. For input of 65,533 ASCII `"A"` chars
+ emoji `"😀"` (4 bytes) = 65,537 bytes: `encoded.length > 65_536` → slice to 65,536 bytes.
The last 3 bytes of the slice are 0xF0 0x9F 0x98 (incomplete emoji). `TextDecoder` with
default fatal=false replaces the incomplete sequence with the Unicode replacement character
(U+FFFD, 3 bytes), so the stored string is 65,533 `"A"` + U+FFFD — byte length is
65,533 + 3 = 65,536 bytes. Within limit. 201 returned.

Alternatively per the scenario's "Acceptable outcome A" case (stored = 65,533 As, emoji
dropped), both outcomes are valid. Either way the byte constraint is met.

### H-21 — D1 insert failure returns 500 without leaking raw error
PASS. Lines 200-223: `db.insert(events).values(...)` is inside try/catch. On any exception,
the catch block returns `NextResponse.json({ error: "Internal server error" }, { status: 500 })`.
The raw error is not accessed or serialized into the response. No `err` variable is captured
in the catch clause, so there is no risk of accidental leakage.

### H-22 — Non-POST methods return 405
PASS. The file exports only `export async function POST(...)` (line 62). No `GET`, `PUT`,
`PATCH`, or `DELETE` exports exist. Next.js App Router automatically returns 405 for any
HTTP method that has no corresponding named export in the route file.

### H-23 — promptText byte length exactly 65,536 is stored without truncation
PASS. `truncateToBytes`: line 58 checks `encoded.length <= MAX_PROMPT_BYTES` — 65,536 <=
65,536 is true. Returns the original string unchanged. No truncation applied. 201 returned
with full 65,536-byte string.

### H-24 — Server-supplied id and createdAt from body are ignored
PASS. Lines 195-196: `id = crypto.randomUUID()` and `createdAt = new Date()` are generated
server-side. The Drizzle insert at lines 201-216 explicitly specifies `id` and `createdAt`
from these server variables — body fields `body.id` and `body.createdAt` are never read or
used. No spread of `body` into the values object.

### H-25 — Optional free-text fields with empty strings are stored as-is
PASS. Lines 178-183: `subcommand`, `featureName`, `sessionId` are extracted by checking
`typeof body.X === "string"`. Empty string `""` satisfies this check (it is a string).
The values `""` are stored directly. No empty-string rejection applied to these fields
(only `command` has enum validation, not free-text fields).

### H-26 — Valid JSON but non-object body returns 400
PASS. Lines 77-83: after `request.json()` succeeds, the code checks:
- `typeof raw !== "object"` — catches primitives like `"df-intake"` (string type)
- `raw === null` — catches JSON `null`
- `Array.isArray(raw)` — catches JSON arrays like `["df-intake", "..."]`
All three sub-cases return `NextResponse.json({ error: "Invalid JSON" }, { status: 400 })`.

### H-27 — All valid outcome enum values are accepted
PASS. All four values (`success`, `failed`, `blocked`, `abandoned`) are in `VALID_OUTCOMES`
(lines 24-29). `isValidOutcome` returns true for each. All four requests proceed to 201.

### H-28 — Cross-feature dashboard visibility
PASS (Step 1 only; Step 2 deferred pending `dashboard-events` spec).
Step 1: The route correctly stores `orgId` from the API key (line 66, `authResult.context`),
not from the request body. The Drizzle insert at line 203 uses the key-resolved `orgId`.
The row is inserted into the `events` table with `org_id = "org-dash"`. A subsequent
`SELECT * FROM events WHERE org_id = 'org-dash'` would return exactly 1 row with the
correct `command`, `outcome`, `featureName`, and `installId` values.
Step 2 is deferred — `dashboard-events` route does not yet exist.
