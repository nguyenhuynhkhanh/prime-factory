# P-02: Missing Config File — Silent Drop

**Type**: unit
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-2, FR-3, BR-1, AC-11

---

## Description

When `~/.df-factory/config.json` does not exist, the script makes no HTTP request, writes nothing to the queue, and exits 0 silently.

---

## Scenario

### Given

- `~/.df-factory/` directory does not exist (or exists but `config.json` is absent).
- A mock `curl` that records whether it was called.

### When

The script is called with:
```bash
cli-lib/log-event.sh '{"command":"df-onboard","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- `curl` was NOT called (zero invocations).
- `~/.df-factory/event-queue.json` does not exist.
- The script exited with code 0.
- No output on stdout or stderr.

---

## Implementation Hint

Override `curl` with a bash function that writes to a counter file and returns 0. Assert the counter file was never written.
