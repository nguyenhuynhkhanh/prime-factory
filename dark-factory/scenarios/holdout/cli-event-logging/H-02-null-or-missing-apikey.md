# H-02: Config with Null or Missing apiKey — Silent Drop

**Type**: unit
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-3, BR-1, EC-2, EC-3

---

## Description

Verifies two distinct sub-cases where the config file exists but provides no usable API key:

- **H-02a**: `apiKey` key is present but set to JSON `null`.
- **H-02b**: `apiKey` key is absent entirely from the JSON object.

In both sub-cases, the script must silently drop the event and not queue it.

---

## Scenario H-02a: null apiKey

### Given

- `~/.df-factory/config.json` contains:
  ```json
  { "apiKey": null, "baseUrl": "https://example.com" }
  ```
- Mock `curl` records invocations.

### When

```bash
cli-lib/log-event.sh '{"command":"df-debug","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- `curl` NOT called.
- Queue file does not exist.
- Exit code 0. No output.

---

## Scenario H-02b: Missing apiKey Key

### Given

- `~/.df-factory/config.json` contains:
  ```json
  { "baseUrl": "https://example.com" }
  ```
- Mock `curl` records invocations.

### When

```bash
cli-lib/log-event.sh '{"command":"df-debug","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- `curl` NOT called.
- Queue file does not exist.
- Exit code 0. No output.

---

## Why This Matters

A naive implementation that does `apiKey=$(jq -r '.apiKey' config.json)` will get the string `"null"` for a JSON null value (not an empty string). The implementation must handle this case — using `jq -r '.apiKey // empty'` or equivalent to convert both null and missing to the empty string.
