# H-03: 4xx During Flush — Drop Queued Event, Continue

**Type**: integration
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-13, BR-2, EC-14

---

## Description

When the queue contains an event that receives a 4xx response during flush, that queued event is dropped (not re-queued). The flush continues (or the current event is still attempted). This validates that 4xx terminal behavior applies consistently to both live and queued events.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- `~/.df-factory/event-queue.json` contains 2 queued events: `payload-A` (old) and `payload-B` (newer).
- A mock `curl` that:
  - Returns `400` for `payload-A` (first call)
  - Returns `201` for `payload-B` (second call)
  - Returns `201` for the current event (third call)

### When

```bash
cli-lib/log-event.sh '{"command":"df-orchestrate","startedAt":"2026-04-07T13:00:00Z"}'
```

### Then

- `curl` was called 3 times (for payload-A, payload-B, and the current event).
- After the script exits, the queue is empty (or contains `{"version":1,"events":[]}`).
- `payload-A` was dropped (received 400) — not re-queued.
- `payload-B` was delivered (received 201) — not in queue.
- The current event was delivered (received 201) — not in queue.
- Script exited with code 0. No output.

---

## Why This Matters

A lazy implementation might stop the flush on the first failure, leaving payload-B and the current event undelivered. Or it might re-queue 4xx failures (violating BR-2). This test catches both bugs.
