# H-04: Queue File Does Not Exist — First Write Creates It With Correct Schema

**Type**: unit
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-9, FR-10

---

## Description

When the script needs to queue an event and no queue file exists yet, the script creates the file with the correct schema. Validates that the initial file structure includes `version: 1` and the events array, not just a bare array or some other format.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- `~/.df-factory/event-queue.json` does NOT exist.
- `~/.df-factory/` directory exists.
- Mock `curl` exits with code 1 (network error).

### When

```bash
cli-lib/log-event.sh '{"command":"df-onboard","startedAt":"2026-04-07T12:00:00Z","sessionId":"sess-x"}'
```

### Then

- `~/.df-factory/event-queue.json` now exists.
- `jq '.version' event-queue.json` returns `1`.
- `jq '.events | length' event-queue.json` returns `1`.
- `jq '.events[0] | keys | sort' event-queue.json` contains `["payload", "queuedAt"]`.
- `jq '.events[0].payload.command' event-queue.json` returns `"df-onboard"`.
- Script exited with code 0. No output.
