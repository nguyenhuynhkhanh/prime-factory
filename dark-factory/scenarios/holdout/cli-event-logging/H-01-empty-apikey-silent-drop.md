# H-01: Config with Empty apiKey String — Silent Drop

**Type**: unit
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-3, BR-1, EC-1

---

## Description

When `config.json` exists and is valid JSON but the `apiKey` field is an empty string, the script treats this as equivalent to a missing API key. No HTTP request is made, nothing is queued.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains:
  ```json
  { "apiKey": "", "baseUrl": "https://example.com" }
  ```
- A mock `curl` that records invocations.
- `~/.df-factory/event-queue.json` does not exist.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- `curl` was NOT called.
- `~/.df-factory/event-queue.json` does not exist.
- Script exited with code 0.
- No stdout or stderr output.
