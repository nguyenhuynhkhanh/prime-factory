# P-03: HTTP 4xx Response — Drop, Do Not Queue

**Type**: integration
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-7, BR-2, AC-1 (negated)

---

## Description

When the server returns any 4xx status code (including 400 and 401), the script drops the event silently and does NOT write it to the queue. 4xx errors are terminal and retrying will never succeed.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains a valid `apiKey` and `baseUrl`.
- A mock `curl` that simulates HTTP 401 (returns exit code 0 but outputs `401` as the HTTP status code).
- `~/.df-factory/event-queue.json` does not exist.

### When

The script is called with a valid payload:
```bash
cli-lib/log-event.sh '{"command":"df-cleanup","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- The script exited with code 0.
- `~/.df-factory/event-queue.json` does not exist (event was NOT queued).
- No output on stdout or stderr.

---

## Implementation Hint

Mock `curl` to echo `401` (or `400`) as its only stdout. The script should parse the HTTP status code from curl's `--write-out "%{http_code}"` output and branch accordingly. Test both 400 and 401 to cover validation errors and auth failures.
