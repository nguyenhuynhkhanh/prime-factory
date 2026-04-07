# P-05: Network Error — Event Queued

**Type**: unit
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-8, FR-9, BR-3, BR-9, AC-4

---

## Description

When curl exits with a non-zero code (simulating network unreachable), the event is appended to the offline queue with a `queuedAt` timestamp. The original payload is preserved verbatim.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- A mock `curl` that exits with code 6 (could not resolve host) and produces no output.
- `~/.df-factory/event-queue.json` does not exist.

### When

The script is called with:
```bash
cli-lib/log-event.sh '{"command":"df-debug","startedAt":"2026-04-07T12:00:00Z","sessionId":"sess-001","subcommand":"debug-agent-spawned"}'
```

### Then

- The script exited with code 0.
- `~/.df-factory/event-queue.json` now exists.
- The file contains valid JSON matching the schema: `{ "version": 1, "events": [ { "queuedAt": "<ISO 8601>", "payload": { ... } } ] }`.
- `events[0].payload` equals `{"command":"df-debug","startedAt":"2026-04-07T12:00:00Z","sessionId":"sess-001","subcommand":"debug-agent-spawned"}`.
- `events[0].queuedAt` is a valid ISO 8601 timestamp (approximately the current time, not the payload's `startedAt`).
- No output on stdout or stderr.

---

## Implementation Hint

Mock `curl` to `return 6` (bash function exit code). After the script runs, use `jq` to parse and assert the queue file contents.
