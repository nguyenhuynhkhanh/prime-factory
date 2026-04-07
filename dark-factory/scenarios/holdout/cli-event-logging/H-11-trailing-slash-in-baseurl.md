# H-11: Trailing Slash in baseUrl — URL Is Well-Formed

**Type**: unit
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: EC-10

---

## Description

When `baseUrl` in the config has a trailing slash (e.g. `"https://example.com/"`), the constructed URL must not contain a double slash before the path component. The correct URL is `https://example.com/api/v1/events`, not `https://example.com//api/v1/events`.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains:
  ```json
  { "apiKey": "test-key", "baseUrl": "https://example.com/" }
  ```
- Mock `curl` records the full URL it was called with.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- The URL passed to `curl` is exactly `https://example.com/api/v1/events` (no double slash).
- Mock `curl` returns `201`.
- Script exited with code 0. No output.

---

## Implementation Hint

Strip a trailing slash from `baseUrl` before concatenating the path: `baseUrl="${baseUrl%/}"` then `"${baseUrl}/api/v1/events"`.
