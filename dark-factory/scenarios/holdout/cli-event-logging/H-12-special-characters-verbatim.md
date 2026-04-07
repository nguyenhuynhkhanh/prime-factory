# H-12: Payload With Special Characters — Passed Verbatim

**Type**: unit
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: EC-11

---

## Description

When the JSON payload contains special characters — double quotes, backslashes, and embedded newlines in string values — the script must pass the payload verbatim to curl without double-encoding, stripping, or escaping. The server receives exactly what was passed as the argument.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- Payload with special characters in `promptText`:
  ```
  {"command":"df-orchestrate","startedAt":"2026-04-07T12:00:00Z","promptText":"line1\nline2 with \"quotes\" and \\backslash"}
  ```
- Mock `curl` records the `--data` argument it received.

### When

```bash
cli-lib/log-event.sh '{"command":"df-orchestrate","startedAt":"2026-04-07T12:00:00Z","promptText":"line1\nline2 with \"quotes\" and \\backslash"}'
```

### Then

- The `--data` value passed to `curl` is byte-for-byte identical to the input argument.
- The JSON string is valid (can be parsed by `jq`).
- Mock `curl` returns `201`.
- Script exited with code 0. No output.

---

## Why This Matters

Shell quoting is notoriously fragile. A common mistake is passing the payload through `echo` or an unquoted variable, which can cause word splitting, backslash interpretation, or shell expansion on `$` characters in the payload. The correct pattern is to use `-d "$PAYLOAD"` or `-d @<(echo "$PAYLOAD")` and ensure `PAYLOAD` is assigned without word-splitting.
