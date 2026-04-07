# Scenario H-02: df-check-onboard.sh with malformed JSON config

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-check-onboard.sh  
**Type**: edge-case  
**Priority**: high — a truncated write or hand-edited config must not cause the script to hang or produce confusing output

**Covers**: FR-10, EC-4, AC-10

## Why This is a Holdout

This scenario tests resilience to disk-state corruption rather than a normal flow. The implementation must rely on `jq`'s behavior when given malformed input (`jq -r '.field // empty'` returns empty on parse error), which is the jq null-safe pattern already used by `log-event.sh`. Verifying this is correct is subtle — a naive implementer might pipe jq output without checking its exit code, which would still produce empty output on malformed JSON. But the scenario also guards against implementations that call `jq` in a way that surfaces a parse error message to stdout instead of empty string.

## Preconditions

- `~/.df-factory/config.json` exists but contains malformed JSON:
  ```
  {"apiKey": "sk_live_abc123", "baseUrl":
  ```
  _(truncated — missing closing value and braces)_

## Action

Run `bash cli-lib/df-check-onboard.sh`

## Expected Outcome

### Stdout
```
DF is not configured. Run df-onboard.sh first.
```

### Exit code
`1`

## Assertions

- The script does not crash or produce an unhandled error (e.g., a raw jq error on stderr is acceptable but must not change stdout)
- stdout contains only the standard "not configured" message — no jq parse errors, no raw JSON fragments
- Exit code is `1`
- No network call is made

## Variant: Empty file

**Precondition override**: `~/.df-factory/config.json` exists but has zero bytes (empty file)

**Expected**: same message, exit code `1`

## Variant: Valid JSON but values are empty strings

**Precondition override**: `~/.df-factory/config.json` contains:
```json
{
  "apiKey": "",
  "baseUrl": ""
}
```

**Expected**: `jq -r '.apiKey // empty'` returns empty string for `""`? — No. `""` is a valid non-null JSON value; `// empty` only fires for `null` or absent keys, NOT for empty strings. Therefore the implementation must also check the string length explicitly, OR the spec allows the server-side key to never be an empty string (since `df-onboard.sh` validates non-empty before writing).

**Clarification (confirmed developer decision)**: `df-onboard.sh` validates that the API key is non-empty before writing. `df-check-onboard.sh` uses `jq -r '.apiKey // empty'` — this returns empty for absent/null fields. An `""` empty-string value in the config is an invalid state that cannot be produced by `df-onboard.sh`, so this variant is out of spec for `df-check-onboard.sh`. Document this constraint: the check is against absent/null, not against empty-string, and `df-onboard.sh` is responsible for preventing empty-string writes.
