# Scenario P-03: df-check-onboard.sh fails with missing config

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-check-onboard.sh  
**Covers**: FR-10, FR-11, AC-9, AC-10

## Preconditions

- `~/.df-factory/config.json` does NOT exist (the directory may or may not exist — either state is valid)

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

- Exactly the message above is printed to stdout
- Exit code is `1`
- No network call is made
- The message is consistent with what would be printed for a missing `apiKey` or `baseUrl` field (same message regardless of which check failed)

## Variant: Config exists but apiKey is missing

**Precondition override**: `~/.df-factory/config.json` exists with content:
```json
{
  "baseUrl": "https://prime-factory.example.com"
}
```
_(no `apiKey` field)_

**Expected**: same message, exit code `1`

## Variant: Config exists but baseUrl is missing

**Precondition override**: `~/.df-factory/config.json` exists with content:
```json
{
  "apiKey": "sk_live_abc123"
}
```
_(no `baseUrl` field)_

**Expected**: same message, exit code `1`
