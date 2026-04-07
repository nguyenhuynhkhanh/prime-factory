# P-07: Corrupted Queue File — Reset and Proceed

**Type**: unit
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-12, BR-6, AC-8

---

## Description

When the queue file exists but contains invalid JSON, the script resets it to an empty queue and proceeds to attempt delivery of the current event. The corrupted data is discarded rather than blocking the current event.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- `~/.df-factory/event-queue.json` exists and contains: `THIS IS NOT JSON }{][`
- A mock `curl` that returns `201`.

### When

The script is called with:
```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- The script exited with code 0.
- `curl` was called exactly once (current event only — no queued events to flush).
- The current event payload was delivered: `{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}`.
- `~/.df-factory/event-queue.json` either does not exist or contains a valid empty queue: `{"version":1,"events":[]}`.
- No output on stdout or stderr.

---

## Implementation Hint

The corrupted queue reset is the key assertion: the script must not attempt to iterate over the corrupted content, and must not pass garbage to curl.
