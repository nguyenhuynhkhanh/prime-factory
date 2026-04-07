# P-06: HTTP 5xx Response — Event Queued

**Type**: unit
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-8, BR-3, AC-4, EC-13

---

## Description

When the server returns an HTTP 5xx status code (server error), the event is treated as transiently failed and appended to the offline queue. This covers both direct 5xx responses and scenarios where the server is unreachable (curl timeout).

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- A mock `curl` that returns exit code 0 but outputs `500` as the HTTP status code.
- `~/.df-factory/event-queue.json` does not exist.

### When

The script is called with:
```bash
cli-lib/log-event.sh '{"command":"df-orchestrate","startedAt":"2026-04-07T12:00:00Z","outcome":"success"}'
```

### Then

- The script exited with code 0.
- `~/.df-factory/event-queue.json` exists and contains exactly 1 queued event.
- `events[0].payload.command` equals `"df-orchestrate"`.
- `events[0].payload.outcome` equals `"success"`.
- No output on stdout or stderr.

---

## Note

Also verify that a `503` response triggers the same queuing behavior — the script should treat the entire 5xx range consistently.
