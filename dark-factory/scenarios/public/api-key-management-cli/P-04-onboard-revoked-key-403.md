# Scenario P-04: df-onboard.sh fails with revoked key (HTTP 403)

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-onboard.sh  
**Covers**: FR-8, BR-1, AC-4, EC-8 (adjacent — 403 is a 4xx non-401 path)

## Preconditions

- `~/.df-factory/config.json` does NOT exist (clean machine)
- Server is reachable at `https://prime-factory.example.com`
- `POST /api/v1/installs/activate` returns HTTP 403 with body `{ "error": "api key revoked" }` for the given API key

## Steps

1. Run `bash cli-lib/df-onboard.sh`
2. At the URL prompt, enter `https://prime-factory.example.com`
3. At the API key prompt, enter `sk_revoked_xyz`

## Expected Outcome

### Stdout
```
API key has been revoked. Ask your admin for a new key.
```

### Exit code
`1`

### File system state
- `~/.df-factory/config.json` does NOT exist — config is never written on failure
- `~/.df-factory/` directory may or may not exist (acceptable either way); if it was created before the network call, that is acceptable — but the config file itself must not be present

## Assertions

- Exit code is `1`
- stdout contains the revoked-key message
- `~/.df-factory/config.json` does not exist after the script exits
- No partial or empty config file is left on disk
