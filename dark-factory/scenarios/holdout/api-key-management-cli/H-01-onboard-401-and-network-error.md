# Scenario H-01: df-onboard.sh with expired key (HTTP 401) and network error

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-onboard.sh  
**Type**: edge-case  
**Priority**: high — distinguishes two distinct 4xx error paths and the network-failure path; all three must produce different messages or the correct fallback

**Covers**: FR-7, FR-9, BR-1, EC-8, AC-5

---

## Case A: HTTP 401 — expired or invalid key

### Preconditions
- `~/.df-factory/config.json` does NOT exist
- Server is reachable at `https://prime-factory.example.com`
- `POST /api/v1/installs/activate` returns HTTP 401 with body `{ "error": "api key expired" }`

### Steps
1. Run `bash cli-lib/df-onboard.sh`
2. Enter URL `https://prime-factory.example.com`
3. Enter API key `sk_expired_abc`

### Expected Outcome

**Stdout**:
```
Invalid or expired API key. Check the key or ask your admin for a new one.
```

**Exit code**: `1`

**File system**: config file not written

---

## Case B: HTTP 400 — server rejects body (treated as generic non-2xx)

### Preconditions
- Same as Case A but server returns HTTP 400 with body `{ "error": "missing required fields" }`

### Expected Outcome

**Stdout**:
```
Failed to connect to https://prime-factory.example.com. Check the URL and try again.
```

**Exit code**: `1`

**File system**: config file not written

### Note
HTTP 400 is not 401 or 403 — must fall into the generic failure branch.

---

## Case C: Network error — curl exits non-zero (host unreachable)

### Preconditions
- `~/.df-factory/config.json` does NOT exist
- No server is reachable at the given URL (DNS failure or connection refused)

### Steps
1. Run `bash cli-lib/df-onboard.sh`
2. Enter URL `https://unreachable.example.com`
3. Enter API key `sk_live_abc123`

### Expected Outcome

**Stdout**:
```
Failed to connect to https://unreachable.example.com. Check the URL and try again.
```

**Exit code**: `1`

**File system**: config file not written

### Assertions (all cases)
- Under no 4xx/network-error condition is the config file written
- The 401 message is distinct from the generic failure message
- The 403 message (tested in P-04) is distinct from the 401 message
- curl is invoked with `--max-time 10` (verifiable by checking the curl invocation or confirming the script does not hang beyond 10 s when the server is slow)
