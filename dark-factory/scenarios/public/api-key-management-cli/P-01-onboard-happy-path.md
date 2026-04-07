# Scenario P-01: df-onboard.sh happy path — config written

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-onboard.sh  
**Covers**: FR-1, FR-3, FR-4, FR-5, FR-6, AC-1

## Preconditions

- `~/.df-factory/config.json` does NOT exist
- `hostname` returns `"dev-laptop"`
- `git config user.email` returns `"alice@example.com"`
- Server is reachable at `https://prime-factory.example.com`
- `POST /api/v1/installs/activate` returns HTTP 200 with body `{ "ok": true }` for the given API key

## Steps

1. Run `bash cli-lib/df-onboard.sh`
2. At the prompt "Enter the server URL (e.g. https://prime-factory.example.com):", enter `https://prime-factory.example.com`
3. At the prompt "Enter your API key:", enter `sk_live_abc123`

## Expected Behavior

### Network call
`df-onboard.sh` makes exactly one HTTP request:
```
POST https://prime-factory.example.com/api/v1/installs/activate
Authorization: Bearer sk_live_abc123
Content-Type: application/json

{"computerName":"dev-laptop","gitUserId":"alice@example.com"}
```

### File system state after success
- Directory `~/.df-factory/` exists with mode `0700`
- File `~/.df-factory/config.json` exists with mode `0600`
- Content of `~/.df-factory/config.json`:
  ```json
  {
    "apiKey": "sk_live_abc123",
    "baseUrl": "https://prime-factory.example.com"
  }
  ```

### Stdout
```
Onboarding complete. You're connected to https://prime-factory.example.com.
```

### Exit code
`0`

## Assertions

- Config file was created with `apiKey` equal to `"sk_live_abc123"`
- Config file was created with `baseUrl` equal to `"https://prime-factory.example.com"` (no trailing slash)
- File permission is `0600` (`-rw-------`)
- Directory permission is `0700` (`drwx------`)
- `log-event.sh` can subsequently read `apiKey` and `baseUrl` from the config without modification
- stdout contains the success string including the base URL
- exit code is `0`
