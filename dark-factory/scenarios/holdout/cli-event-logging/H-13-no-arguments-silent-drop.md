# H-13: No Arguments Provided — Silent Drop

**Type**: unit
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: EC-12, FR-14, FR-15

---

## Description

When `log-event.sh` is called with no positional arguments (no payload JSON), the script must exit 0 silently without making any network request or modifying the queue. This is a defensive case — callers should always pass a payload, but a missing argument must not crash the script or produce output.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- Mock `curl` records whether it was called.
- `~/.df-factory/event-queue.json` does not exist.

### When

```bash
cli-lib/log-event.sh
```
(Called with zero arguments.)

### Then

- `curl` was NOT called.
- `~/.df-factory/event-queue.json` does not exist.
- Script exited with code 0.
- Stdout is empty.
- Stderr is empty.

---

## Why This Matters

Without defensive argument handling, a missing `$1` reference will cause the script to send an empty or null JSON body, or (if `set -u` is active) to exit non-zero — both violations. A bare `${1}` in an unquoted context can also cause word-splitting errors. The script must guard against missing arguments at the top.
