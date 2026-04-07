# P-01: Happy-Path Event Delivery

**Type**: integration
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-1, FR-2, FR-5, FR-6, AC-1

---

## Description

When the config file is present and valid, the server is reachable, and the server returns HTTP 201, the script sends the JSON payload to `POST {baseUrl}/api/v1/events` with the correct headers and exits 0. No queue file is written.

---

## Scenario

### Given

- `~/.df-factory/config.json` exists and contains:
  ```json
  { "apiKey": "test-api-key-abc123", "baseUrl": "https://example.com" }
  ```
- A mock HTTP server listening locally that returns `HTTP 201` with body `{"ok":true,"id":"uuid-1"}` for any POST to `/api/v1/events`.
- `~/.df-factory/event-queue.json` does not exist.

### When

The script is called with:
```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z","sessionId":"sess-001"}'
```

### Then

- The mock server received exactly one POST request to `/api/v1/events`.
- The request body is the valid JSON: `{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z","sessionId":"sess-001"}`.
- The request included the header `Authorization: Bearer test-api-key-abc123`.
- The request included the header `Content-Type: application/json`.
- The script exited with code 0.
- `~/.df-factory/event-queue.json` does not exist (no queuing on success).
- No output was written to stdout or stderr.

---

## Implementation Hint

In the bats test, use a mock `curl` function (override `curl` with a bash function that captures its arguments) to verify the URL, headers, and body passed to curl without making a real network request. Record the invocation to a temp file and assert its contents.
