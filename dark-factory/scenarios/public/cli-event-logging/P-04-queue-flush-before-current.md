# P-04: Queue Flush Before Current Event

**Type**: integration
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-4, FR-13, BR-4, EC-4, AC-5, AC-6

---

## Description

When the queue contains events from a previous offline period, those events are flushed (in order) before the current event is sent. The flush is successful, so the queue is empty afterward and the current event is delivered.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- `~/.df-factory/event-queue.json` contains:
  ```json
  {
    "version": 1,
    "events": [
      {
        "queuedAt": "2026-04-07T11:00:00.000Z",
        "payload": {"command":"df-intake","startedAt":"2026-04-07T10:59:00Z","sessionId":"sess-old"}
      }
    ]
  }
  ```
- A mock `curl` that records all invocations in order and always returns `201`.

### When

The script is called with:
```bash
cli-lib/log-event.sh '{"command":"df-orchestrate","startedAt":"2026-04-07T12:00:00Z","sessionId":"sess-new"}'
```

### Then

- `curl` was called exactly 2 times.
- The FIRST call sent the queued payload: `{"command":"df-intake","startedAt":"2026-04-07T10:59:00Z","sessionId":"sess-old"}`.
- The SECOND call sent the current payload: `{"command":"df-orchestrate","startedAt":"2026-04-07T12:00:00Z","sessionId":"sess-new"}`.
- After the script exits, `~/.df-factory/event-queue.json` either does not exist or contains `{"version":1,"events":[]}`.
- Script exited with code 0.
- No output on stdout or stderr.

---

## Implementation Hint

Record each curl invocation (with arguments) to a temp file in sequence. Assert invocation count and payload order by parsing the recorded calls.
