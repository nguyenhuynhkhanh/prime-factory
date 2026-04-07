# H-07: Large Queue — All Successful Events Removed After Full Flush

**Type**: integration
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-4, FR-13, BR-4, BR-5, EC-8

---

## Description

The queue contains 5 events accumulated from a prolonged offline period. On the next invocation, all 5 are flushed successfully (all return 201), and then the current event is also delivered. The queue is empty afterward.

This is EC-8 from the spec: a large queue is fully drained before the current event is added.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- `~/.df-factory/event-queue.json` contains 5 queued events, with `payload.command` values `"df-intake"`, `"df-debug"`, `"df-orchestrate"`, `"df-onboard"`, `"df-cleanup"` respectively.
- Mock `curl` always returns `201`.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T15:00:00Z","sessionId":"sess-new"}'
```

### Then

- `curl` was called exactly 6 times (5 queued + 1 current).
- The first 5 calls correspond to the 5 queued events, in their original order (by `queuedAt`).
- The 6th call is the current event.
- `~/.df-factory/event-queue.json` is either absent or contains `{"version":1,"events":[]}`.
- Script exited with code 0. No output.

---

## Why This Matters

Validates that the flush loop correctly iterates all queued entries and removes all of them. A loop that only removes the first entry and exits would leave 4 events stranded.
