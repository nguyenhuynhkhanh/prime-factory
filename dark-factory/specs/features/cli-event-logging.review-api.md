# API Design & Backward Compatibility Review — cli-event-logging

## Status: APPROVED WITH NOTES

---

## Blockers (if any)

None.

---

## Concerns (non-blocking)

### C-1 — `startedAt` future-time validation is undocumented

The server (`route.ts` line 102) rejects any `startedAt` more than **one hour in the future** with a `400` response:

```ts
if (startedAtDate.getTime() > Date.now() + 60 * 60 * 1000) {
  return NextResponse.json({ error: "startedAt is too far in the future" }, { status: 400 });
}
```

The spec's request-body field table documents `startedAt` as "ISO 8601 string, When the command or sub-agent started" with no mention of this constraint. Under FR-7/BR-2, a 400 causes the event to be silently dropped — not queued. A developer whose machine clock is >1 hour ahead of the server will lose events permanently with no feedback. This is the most significant documentation gap because it can produce a valid-looking invocation that always fails at the server and is never retried.

**Recommendation:** Add a note to the `startedAt` row in the request-body table: *"Rejected with 400 if more than 1 hour in the future; events are not re-queued."* Also consider adding an EC-15 for clock-skew > 1 hour.

---

### C-2 — `endedAt >= startedAt` constraint is undocumented

The server (`route.ts` lines 125–130) returns `400` when `endedAt` is earlier than `startedAt`:

```ts
if (endedAtDate.getTime() < startedAtDate.getTime()) {
  return NextResponse.json({ error: "endedAt must be >= startedAt" }, { status: 400 });
}
```

The spec lists `endedAt` as an optional field with no ordering constraint noted. A buggy caller that passes `endedAt` before `startedAt` will have the event silently dropped. Non-blocking because it requires a caller bug, but the constraint should be documented in the field table.

---

### C-3 — Queue `version` field has no consumer-side version check specified

The spec states `version: 1` is "reserved for future format migrations" and describes EC-6: any queue with an unexpected schema is treated as corrupted and reset to empty. However, no requirement specifies what the script should do when it reads `version: 2` (or higher) from a queue written by a future version of the script. Under the current spec, an older script encountering a v2 queue would evaluate it against EC-6's schema check — but a `{ "version": 2, "events": [...] }` document *does* satisfy the expected schema shape, so the old script would happily process it, potentially misinterpreting v2-format event entries.

**Recommendation:** Add a requirement (or EC item) stating: *"If `queue.version !== 1`, treat the queue file as corrupted and reset to empty."* This makes the `version` field actually functional as a migration guard.

---

### C-4 — Working-directory fragility is acknowledged but not hardened

The spec states: *"The path `cli-lib/log-event.sh` is a convention — callers must ensure the working directory is the repo root."* This is a soft coupling enforced only by convention. If any `df-*` skill or sub-agent `cd`s into a subdirectory before calling the script, the relative path `cli-lib/log-event.sh` will fail to resolve entirely (shell "command not found" or silent no-op depending on calling context). The script's internal logic is unaffected once running (all paths are under `~/`), but invocation itself is fragile.

**Recommendation:** Add an NFR or implementation note mandating that callers use either an absolute path or a `$BASH_SOURCE`-relative invocation pattern (e.g., `"$(dirname "$BASH_SOURCE")/../../cli-lib/log-event.sh"`). This is a delivery concern, not an API concern, but it determines whether the API is ever reached at all.

---

### C-5 — "64 KB" vs "64 KiB" imprecision

The server sets `MAX_PROMPT_BYTES = 65_536`, which is 64 **kibibytes** (KiB). The spec's field table says *"Truncated server-side to 64 KB"* — strictly, 64 KB = 64,000 bytes. In common software usage these terms are interchangeable, but the spec is technically imprecise by 1,536 bytes. No practical impact; worth a one-word fix: *"64 KiB (65,536 bytes)"*.

---

## Approved aspects

- **`command` enum exact match**: Spec lists `df-intake`, `df-debug`, `df-orchestrate`, `df-onboard`, `df-cleanup` — identical to server `VALID_COMMANDS`. No drift.

- **`outcome` enum exact match**: Spec lists `success`, `failed`, `blocked`, `abandoned` — identical to server `VALID_OUTCOMES`. No drift.

- **Required fields always present in example payloads**: All three lifecycle call sites (command start, sub-agent spawned, command end) and the queue file data model example include both `command` and `startedAt`. No example omits either required field.

- **`Authorization: Bearer` format is correct**: Server (`requireApiKey.ts` line 66) checks `authHeader.startsWith("Bearer ")` and slices exactly `"Bearer ".length` characters. Spec FR-5 specifies `Authorization: Bearer {apiKey}` — format matches precisely.

- **HTTP status routing correctly maps to server's actual codes**:
  - Server returns `201` on success → spec table maps 201 to "deliver". ✅
  - Server returns `400` for all validation failures → spec FR-7 drops 4xx. ✅
  - Server returns `401` for missing/invalid API key → spec FR-7 drops 4xx (including 401). ✅
  - Server returns `500` for DB errors and for misconfigured `API_KEY_SALT` (the salt-check path in `requireApiKey` also returns 500) → spec FR-8 queues 5xx. ✅
  - FR-6 accepting "2xx" (not strictly "201") is forward-safe if the server ever changes the success code.

- **`promptText` server-side truncation acknowledged**: Spec field table correctly notes *"Truncated server-side to 64 KB"*, matching the `truncateToBytes` implementation. The script passes `promptText` verbatim; no client-side truncation is needed or attempted.

- **Response body is never parsed**: The script captures only the HTTP status code via `--write-out "%{http_code}" --output /dev/null`. This eliminates any risk of the script breaking due to response body schema changes in the future.

- **Queue file format has explicit forward-compat framing**: The `version: 1` field and the `events[]` array mapping directly to future batch semantics are called out in the Scaling Path section. The intent is sound; see C-3 for the gap in enforcement.

- **4xx-during-flush correctly handled**: FR-13 and BR-2 correctly specify that 4xx responses during queue flush cause the queued entry to be dropped (not re-queued), consistent with server behavior where 4xx always indicates a permanent client-side error.

- **`durationMs` and `roundCount` type constraints match**: Spec says "number (≥ 0)" and "integer (≥ 0)" respectively — consistent with server validation (`Number.isFinite`, `Number.isInteger`, `>= 0`).
