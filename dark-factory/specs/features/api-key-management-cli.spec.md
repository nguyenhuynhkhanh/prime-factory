# Feature: api-key-management-cli

## Context

Developers must register their machine with the Dark Factory server before the CLI can post telemetry events. Without this, `log-event.sh` silently exits early (no config file). The existing `log-event.sh` script already reads `~/.df-factory/config.json` for `apiKey` and `baseUrl` — this spec adds the two companion scripts that create and validate that config.

This is a sub-spec of Admin API Key Management. It covers only the two shell scripts the developer runs locally:
- `df-onboard.sh` — interactive registration: validates credentials with the server, writes config
- `df-check-onboard.sh` — offline guard: used by other scripts to abort early if the machine is not configured

Both scripts must match the style, patterns, and file paths of the existing `cli-lib/log-event.sh`.

## Scope

### In Scope (this spec)
- `cli-lib/df-onboard.sh`: interactive script that calls `POST /api/v1/installs/activate`, writes `~/.df-factory/config.json` on success
- `cli-lib/df-check-onboard.sh`: offline config-presence check with machine-readable exit codes and a single error message
- Re-onboard flow: prompt before overwriting an existing config
- gitUserId fallback chain: `git config user.email` → `git config user.name` → `$USER`
- URL normalization: trailing slash stripping, scheme validation
- Secure file permissions: `0700` on directory, `0600` on config file
- jq-optional JSON construction in `df-onboard.sh` (use jq if available, otherwise string interpolation)

### Out of Scope (explicitly deferred)
- Config format versioning or migration of old config files
- API key rotation / re-key without re-onboarding
- Multi-profile or per-project config (single global config file only)
- Offline queuing in `df-onboard.sh` (it is interactive and requires a live server)
- Any changes to `log-event.sh` (it already reads the config correctly)
- Windows / non-POSIX shell support

### Scaling Path
If config ever needs versioning (e.g., adding an `orgId` field), `df-check-onboard.sh` can add a version field check without breaking `log-event.sh`, which uses the same jq null-safe read pattern. `df-onboard.sh` can be extended to accept flags (e.g., `--url`, `--key`) for non-interactive CI use, which is a natural v2 addition.

## Requirements

### Functional

- FR-1: `df-onboard.sh` prompts for server URL and API key interactively. — Developers may not know the URL at script-install time; interactive prompts are the only safe default.
- FR-2: If `~/.df-factory/config.json` already exists, `df-onboard.sh` prompts "Config already exists. Re-onboard? [y/N]" and exits 0 silently on any answer that is not `y` or `Y`. — Protects against accidental overwrites; idempotent re-run from a new machine is supported by answering `y`.
- FR-3: `df-onboard.sh` strips trailing slashes from the URL input and validates that it starts with `http://` or `https://`. — Prevents silent failures caused by malformed base URLs reaching `log-event.sh`.
- FR-4: `df-onboard.sh` collects `computerName` from `hostname` and `gitUserId` via the fallback chain: `git config user.email` → `git config user.name` → `$USER`. — Ensures a non-empty `gitUserId` is always sent even on machines with minimal git config.
- FR-5: `df-onboard.sh` calls `POST <baseUrl>/api/v1/installs/activate` with `Authorization: Bearer <apiKey>`, `Content-Type: application/json`, body `{"computerName":"…","gitUserId":"…"}`, and a 10-second timeout. — Matches the server contract defined in `api-key-management-server`.
- FR-6: On HTTP 200, `df-onboard.sh` writes `{ "apiKey": "…", "baseUrl": "…" }` to `~/.df-factory/config.json` with permissions `0600`, creating the directory with `0700` if absent, then prints "Onboarding complete. You're connected to <baseUrl>." — Config must be readable by `log-event.sh` immediately after onboarding.
- FR-7: On HTTP 401, `df-onboard.sh` prints "Invalid or expired API key. Check the key or ask your admin for a new one." and exits 1. — Surfaces the actionable reason for failure to the developer.
- FR-8: On HTTP 403, `df-onboard.sh` prints "API key has been revoked. Ask your admin for a new key." and exits 1. — Surfaces the actionable reason for failure to the developer.
- FR-9: On network error or any non-2xx response other than 401/403, `df-onboard.sh` prints "Failed to connect to <baseUrl>. Check the URL and try again." and exits 1. — Covers connectivity failures, bad URLs, and unexpected server errors.
- FR-10: `df-check-onboard.sh` checks that `~/.df-factory/config.json` exists, that `.apiKey` is non-empty, and that `.baseUrl` is non-empty, using `jq -r '.field // empty'`. If any check fails, prints "DF is not configured. Run df-onboard.sh first." and exits 1. If all checks pass, exits 0 with no output. — Machine-readable exit codes allow callers to guard on `df-check-onboard.sh || exit 1` without parsing output.
- FR-11: `df-check-onboard.sh` makes no network call. — It must work offline and complete instantly so it is safe to call at the start of any CLI script.

### Non-Functional

- NFR-1: `df-onboard.sh` uses `curl --max-time 10` for the activation call. — Prevents the script from hanging indefinitely on a slow or unreachable server.
- NFR-2: Both scripts use `#!/usr/bin/env bash` and are POSIX-compatible within bash. — Consistent with `log-event.sh`.
- NFR-3: `df-check-onboard.sh` produces no output on success. — Caller scripts use exit code only; stdout noise would break pipelines.
- NFR-4: Both scripts use the same config path as `log-event.sh`: `$HOME/.df-factory/config.json`. — Config location must be consistent across all CLI tools.
- NFR-5: JSON construction in `df-onboard.sh` uses `jq` if available, otherwise falls back to safe string interpolation. — `jq` is already a dependency of `log-event.sh`; the fallback handles constrained environments where jq has not been installed yet.

## Data Model

No server-side schema changes. Config written to developer's local machine only:

**`~/.df-factory/config.json`** (created by `df-onboard.sh`, read by `log-event.sh` and `df-check-onboard.sh`):
```json
{
  "apiKey": "<bearer token string>",
  "baseUrl": "https://prime-factory.example.com"
}
```

- Directory `~/.df-factory/`: mode `0700`
- File `config.json`: mode `0600`
- `baseUrl` is stored WITHOUT trailing slash (normalized at write time)

## Migration & Deployment

N/A — no existing data affected. These are new scripts. The config file `~/.df-factory/config.json` is created fresh by `df-onboard.sh` on first run. Existing developer machines that have no config will receive it after running `df-onboard.sh` for the first time.

The only "migration" concern: developers who already have a config written by an older or manually created file will be protected by the re-onboard prompt (FR-2) and the jq null-safe reads in `df-check-onboard.sh` (FR-10).

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/installs/activate | Register machine install; validates API key | Bearer token |

Contract (from `api-key-management-server` spec):
- Request: `Authorization: Bearer <apiKey>`, body `{ computerName: string, gitUserId: string }`
- 200: `{ ok: true }`
- 400: `{ error: "missing required fields" }`
- 401: `{ error: "api key expired" }` or `{ error: "unauthorized" }`
- 403: `{ error: "api key revoked" }`

## Business Rules

- BR-1: The config file is only written after a successful HTTP 200 from the activation endpoint. — A partial or failed onboarding must not leave a broken config that `log-event.sh` would silently misuse.
- BR-2: `expires_at` begins counting from creation time on the server — `df-onboard.sh` does not need to track or display expiry. — Confirmed developer decision; the CLI is stateless with respect to key lifetime.
- BR-3: Re-onboarding (answering `y` to the prompt) fully overwrites the config file. — Allows a developer to update the URL or switch API keys from a new machine without manual file editing.
- BR-4: `baseUrl` is normalized (trailing slashes stripped) before both the activation call and the config write. — Must match the format `log-event.sh` expects when it constructs `${BASE_URL}/api/v1/events`.
- BR-5: `gitUserId` must never be empty in the activation payload. The fallback chain (`email → name → $USER`) guarantees this. — The server's `computerName + gitUserId` pair is used to identify the install; an empty value would produce a meaningless identity.

## Error Handling

| Scenario | Response | Side Effects |
|----------|----------|--------------|
| URL does not start with `http://` or `https://` | Print "Invalid URL. Must start with http:// or https://." and exit 1 | No network call made, no config written |
| API key input is empty | Print "API key cannot be empty." and exit 1 | No network call made |
| HTTP 401 from activation endpoint | Print "Invalid or expired API key. Check the key or ask your admin for a new one." and exit 1 | No config written |
| HTTP 403 from activation endpoint | Print "API key has been revoked. Ask your admin for a new key." and exit 1 | No config written |
| Network error / curl non-zero exit / non-2xx other | Print "Failed to connect to <baseUrl>. Check the URL and try again." and exit 1 | No config written |
| `df-check-onboard.sh`: config file missing | Print "DF is not configured. Run df-onboard.sh first." and exit 1 | None |
| `df-check-onboard.sh`: `apiKey` field empty or absent | Print "DF is not configured. Run df-onboard.sh first." and exit 1 | None |
| `df-check-onboard.sh`: `baseUrl` field empty or absent | Print "DF is not configured. Run df-onboard.sh first." and exit 1 | None |
| Re-onboard prompt answered N (or empty) | Exit 0 silently | No network call, existing config untouched |

## Acceptance Criteria

- [ ] AC-1: Running `df-onboard.sh` on a machine with no config, providing a valid URL and API key, results in `~/.df-factory/config.json` containing `apiKey` and `baseUrl`, with permissions `0600`, and the directory at `0700`.
- [ ] AC-2: Running `df-onboard.sh` when config already exists and answering `N` leaves the original config unchanged and exits 0.
- [ ] AC-3: Running `df-onboard.sh` when config already exists and answering `y` overwrites the config with fresh values.
- [ ] AC-4: `df-onboard.sh` with a revoked key (403) exits 1 with the revoked-key message and writes no config.
- [ ] AC-5: `df-onboard.sh` with an expired/invalid key (401) exits 1 with the expired-key message and writes no config.
- [ ] AC-6: `df-onboard.sh` strips trailing slashes from the URL before the network call and before writing to config.
- [ ] AC-7: `df-onboard.sh` uses the gitUserId fallback chain: email → name → `$USER`.
- [ ] AC-8: `df-check-onboard.sh` exits 0 with no output when config is present and has both non-empty fields.
- [ ] AC-9: `df-check-onboard.sh` exits 1 with the configured message when config file is absent.
- [ ] AC-10: `df-check-onboard.sh` exits 1 when config exists but `apiKey` or `baseUrl` is missing or empty.
- [ ] AC-11: `df-check-onboard.sh` makes no network call under any condition.

## Edge Cases

- EC-1: Developer enters URL with one or more trailing slashes (e.g., `https://example.com///`) — must be stripped to `https://example.com` before call and write.
- EC-2: `git config user.email` returns empty string (not unset — empty) — must fall through to `git config user.name`.
- EC-3: Both `git config user.email` and `git config user.name` are empty — must fall through to `$USER`.
- EC-4: Config file exists but is malformed JSON (e.g., truncated write) — `df-check-onboard.sh` must treat this as missing fields (jq returns empty) and exit 1 with the standard message.
- EC-5: Developer answers with uppercase `Y` to the re-onboard prompt — must be accepted (case-insensitive y/Y).
- EC-6: Developer presses Enter without typing anything at the re-onboard prompt — treated as `N`, exits 0 silently.
- EC-7: `hostname` command returns a hostname with spaces or special characters — must be safely embedded in JSON. Use jq for construction when available to handle escaping; when using string interpolation, the `computerName` value is passed through as-is (the hostname command on macOS/Linux does not produce values requiring JSON escaping in practice).
- EC-8: Server returns HTTP 400 (missing required fields) — treated as a generic non-2xx failure; print the "Failed to connect" message and exit 1.

## Dependencies

- **Depends on**: `api-key-management-server` — `df-onboard.sh` calls `POST /api/v1/installs/activate`. The server spec must be complete and the endpoint must exist before this script can be tested end-to-end.
- **Depended on by**: nothing in the current feature set; future scripts may call `df-check-onboard.sh` as a guard.
- **Group**: Admin API Key Management

## Implementation Size Estimate

- **Scope size**: small (2 new files, ~80-120 lines each)
- **Suggested parallel tracks**: 1 track only — the two scripts are small and share no logic, but the total work is under a day; splitting introduces coordination overhead with no benefit. One code-agent writes both files sequentially.

## Implementation Notes

Follow `cli-lib/log-event.sh` patterns exactly:
- Config path: `$HOME/.df-factory/config.json`
- Directory creation: `mkdir -p -m 0700 "$DF_DIR"`
- jq null-safe reads: `jq -r '.fieldName // empty'`
- curl flags: `--silent`, `--output /dev/null`, `--write-out "%{http_code}"` — but for `df-onboard.sh`, capture the response body separately to check `ok` field: use `curl -s -w "\n%{http_code}" ...` and split on the last line.
- Trailing slash strip: `BASE_URL="${BASE_URL%/}"` — apply immediately after reading URL input.
- Exit codes: 0 on success, 1 on any error requiring user action.
- `df-onboard.sh` differs from `log-event.sh` in that it DOES produce user-visible output (stdout messages) and DOES exit non-zero on failure — it is interactive, not fire-and-forget.

## Traceability

| Spec Item | Scenario(s) |
|-----------|-------------|
| FR-1 | P-01 |
| FR-2 | P-05, P-06 |
| FR-3 | H-03, P-01 |
| FR-4 | H-04 |
| FR-5 | P-01 |
| FR-6 | P-01 |
| FR-7 | H-01 |
| FR-8 | P-04 |
| FR-9 | H-01 (network error path) |
| FR-10 | P-02, P-03 |
| FR-11 | P-02, P-03 |
| BR-1 | P-04, H-01 |
| BR-3 | P-05 (re-onboard y) |
| BR-4 | H-03 |
| BR-5 | H-04 |
| EC-1 | H-03 |
| EC-2 | H-04 |
| EC-3 | H-04 |
| EC-4 | H-02 |
| EC-5 | P-05 |
| EC-6 | P-06 (N answer) |
| EC-7 | P-01 (implicitly, hostname used) |
| EC-8 | H-01 (non-2xx path) |
