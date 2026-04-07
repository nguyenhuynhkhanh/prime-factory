# H-05: Partial Flush Failure — Succeeded Removed, Failed Kept

**Type**: integration
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-13, BR-4, BR-5, EC-8, EC-9

---

## Description

When the queue contains multiple events and only some of them succeed during flush, only the successfully delivered events are removed from the queue. Failed events remain for the next retry.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- `~/.df-factory/event-queue.json` contains 3 queued events with payloads `payload-1`, `payload-2`, `payload-3`.
- A mock `curl` that:
  - Returns `201` for `payload-1` (first call — succeeds)
  - Returns `500` for `payload-2` (second call — fails transiently)
  - Returns `201` for `payload-3` (third call — would succeed, but...)

  Note: the implementation may stop flushing after the first failure or continue. This test is designed to be agnostic to that choice — the key assertion is that successfully delivered events are removed.

  **Variant A** (implementation continues after failure):
  - curl call order: payload-1 (201), payload-2 (500), payload-3 (201), current (5xx)

  **Variant B** (implementation stops after first failure):
  - curl call order: payload-1 (201), payload-2 (500), [stops], current (5xx)

### When

```bash
cli-lib/log-event.sh '{"command":"df-cleanup","startedAt":"2026-04-07T14:00:00Z"}'
```
(Current event also fails with 5xx.)

### Then (Variant A — continue-on-failure)

- `~/.df-factory/event-queue.json` contains exactly 2 events: `payload-2` and the current event.
- `payload-1` and `payload-3` are NOT in the queue.

### Then (Variant B — stop-on-failure)

- `~/.df-factory/event-queue.json` contains at least `payload-2`, `payload-3`, and the current event.
- `payload-1` is NOT in the queue (it was delivered).

### Common Assertions (both variants)

- Script exited with code 0.
- `payload-1` is never in the final queue (it was delivered successfully).
- Queue file contains valid JSON with the correct schema.
- No stdout or stderr output.

---

## Why This Matters

The critical invariant is: once an event is ACKed by the server (2xx), it must never appear in the queue again. A naive implementation that rewrites the whole queue only at the end might lose successfully delivered events if it crashes mid-flush. An atomic per-event removal is required.
