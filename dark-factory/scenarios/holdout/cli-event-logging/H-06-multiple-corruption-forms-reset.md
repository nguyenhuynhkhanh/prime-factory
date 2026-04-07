# H-06: Multiple Forms of Queue File Corruption — Always Reset

**Type**: unit
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-12, BR-6, EC-5, EC-6

---

## Description

Validates that any non-conformant queue file content is treated as corrupted and reset — not just completely invalid JSON. Tests three distinct corruption forms in separate sub-scenarios.

---

## Scenario H-06a: Empty File (Zero Bytes)

### Given

- `~/.df-factory/event-queue.json` exists and is empty (0 bytes).
- Mock `curl` returns `201`.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- Script exited with code 0.
- `curl` called once with the current event.
- Queue file does not exist or contains a valid empty queue.
- No output.

---

## Scenario H-06b: Valid JSON but Wrong Shape (Plain Array)

### Given

- `~/.df-factory/event-queue.json` contains: `[{"command":"df-intake"}]`
  (A bare array, not the expected `{ "version": 1, "events": [...] }` schema.)
- Mock `curl` returns `201`.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- Script exited with code 0.
- `curl` called once with the current event (the array content was not iterated as queued events).
- No output.

---

## Scenario H-06c: Valid JSON but Empty Object `{}`

### Given

- `~/.df-factory/event-queue.json` contains: `{}`
- Mock `curl` returns `500`.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- Script exited with code 0.
- Queue file after the run either has valid schema with 1 event OR does not exist — but it does NOT have `{}` as its content.
- No output.

---

## Why This Matters

The spec says "treat as empty, reset queue" — this must apply to structurally valid-but-wrong JSON, not just parse failures. An implementation that only checks `jq . < queue.json` for parse success would pass H-06a and fail H-06b/c.
