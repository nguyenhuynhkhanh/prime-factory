# Security & Data Integrity Review — cli-event-logging

## Status: APPROVED WITH NOTES

## Blockers (if any)

None.

## Concerns (non-blocking)

### 1. Shell injection via the payload argument (EC-11 / FR-1)

The spec correctly identifies in EC-11 that the payload may contain special characters (quotes, backslashes, newlines in `promptText`), and states the script must pass the payload "verbatim to curl without double-encoding or stripping characters." This is the right requirement, but the implementation note hints at a pattern that can go wrong.

The implementation note says to use `curl ... --data "$PAYLOAD"` (implied) where `$PAYLOAD` is the raw shell argument. If the implementor passes the payload via a shell variable interpolated into a `curl` command string — rather than as a curl `--data @-` pipe or a properly quoted `--data` argument — a payload containing `$(...)` or backticks will be evaluated by bash before curl sees it. The spec requires the payload comes in as `$1` (a positional argument); that is already word-split-safe at the call site in bash, but downstream passing to `jq` or `curl` must use double-quoted variable references (`"$1"`, `"$PAYLOAD"`) at every step, not unquoted.

The spec does not explicitly mandate double-quoting of all variable expansions in the implementation. It should. The risk is real: `promptText` can be 64 KB of arbitrary developer-entered text per the server contract.

**Recommendation:** Add an explicit implementation constraint: all shell variable expansions that carry user-supplied data (`$1`, `$PAYLOAD`, `$API_KEY`, `$BASE_URL`) must be double-quoted at every point of use, including in `jq` `--argjson` / `--arg` arguments and in the `curl --data` argument.

### 2. API key written to the queue file

The spec is clear that `apiKey` is read from `~/.df-factory/config.json` and used only in the `Authorization` header. The queue file stores only `payload` (the event body) and `queuedAt`. The spec correctly never puts the API key into the queue.

However, the config file (`~/.df-factory/config.json`) holds the API key in plaintext, and the spec does not specify file permissions for either `~/.df-factory/` or `config.json`. The `df-onboard` skill creates this file (out of scope here), but if the directory is created world-readable — and the spec (FR-10) tells this script to `mkdir` the directory when absent — the script's `mkdir` call should create the directory with mode `0700`, not the default umask-derived mode. The spec does not state this.

**Recommendation:** Specify that `mkdir ~/.df-factory` (FR-10) must use mode `0700` (`mkdir -m 0700`). Similarly, queue file writes should use a umask of 0077 or explicitly `chmod 0600` after creation. The API key is an authentication secret; world-readable files under `~/.df-factory/` are a local privilege escalation risk on shared machines.

### 3. Temp file used for atomic queue write — race between mktemp and mv

The implementation note specifies: "write the updated JSON back atomically using a temp file + `mv`." The spec mandates `flock` protects the queue read-modify-write cycle. However, the temp file itself (`mktemp`) is typically created in `/tmp` by default, which is world-writable on most systems. A symlink attack on `/tmp/<tempfile>` between `mktemp` creation and `mv` is a theoretical concern on shared machines (relevant given these run on developer laptops, which may be multi-user in CI environments).

The risk is low (attacker must know the mktemp filename, the window is tiny) but can be entirely eliminated by creating the temp file in the same directory as the queue file: `mktemp ~/.df-factory/.event-queue.XXXXXX`. The spec does not specify this.

**Recommendation:** Note in the spec or implementation notes that `mktemp` should create the temp file under `~/.df-factory/` so the eventual `mv` is atomic on the same filesystem and the temp file inherits the same directory permission boundary.

### 4. flock FD pattern — lock on queue file vs. a separate lock file

The spec's implementation note shows: `( flock -x 200; <operations> ) 200>>"$QUEUE_FILE"`. Opening the queue file itself with `>>` as the lock descriptor means the lock is acquired by appending to the file. This is a common pattern and safe for its intended purpose. However, opening `QUEUE_FILE` with `>>` before checking whether it exists or is valid means if a corrupt file is present, the `>>` open still succeeds (it does not parse JSON), so the lock works regardless — this is correct behavior consistent with FR-12.

One subtlety: `flock` on macOS requires `util-linux` (homebrew). The spec acknowledges this in NFR-2. There is no fallback if `flock` is absent. Per the silent-drop philosophy, a missing `flock` will cause the subshell to fail and the event to be silently dropped. This is acceptable per BR-8 but means concurrent corruption can occur silently if the developer never installed `util-linux`. The spec accepts this risk implicitly via NFR-2 but does not state it as an accepted risk. No action needed; noting for completeness.

### 5. Silent drop of all errors creates a security blind spot for credential failures

FR-7 specifies that HTTP 401 is silently dropped and not queued — this is correct (a bad key will never succeed on retry). However, the script never surfaces a 401 to the developer. If an API key is revoked or expired, every subsequent `df-*` command silently discards its telemetry with no developer-visible signal. The CTO dashboard will show a gap in data that is indistinguishable from the developer being offline.

This is an accepted design choice (BR-8, FR-14, FR-15), and the silent-drop behavior is intentional. It is not a security vulnerability per se. However, it does create an **operational security blind spot**: a compromised or stolen API key that the server has revoked will result in silent data loss rather than a visible failure that prompts the developer to re-onboard.

**Recommendation:** Document this as an accepted limitation. A future improvement (outside v1 scope) could be a persistent flag file that signals "last attempt received 401" so a subsequent `df-*` command can surface a one-time warning.

### 6. baseUrl is not validated before being passed to curl

The spec (EC-10) handles the trailing-slash normalization case, but `baseUrl` read from `config.json` is otherwise passed verbatim to curl as the destination URL. If `config.json` is tampered with (or written with a malicious value by `df-onboard`), `baseUrl` could be set to a URL that exfiltrates the API key (e.g., `http://attacker.example.com`). Since `config.json` lives in the developer's home directory and is written by `df-onboard` (a tool the developer ran intentionally), this is a local-only threat with no network attack surface. No external party controls `baseUrl`.

This is not a blocker — the threat model is the same as any credential file — but it is worth noting that `baseUrl` is fully trusted and the API key travels to wherever `baseUrl` points.

## Approved aspects

- **API key read path is correct.** The key is read from `~/.df-factory/config.json` using `jq -r '.apiKey // empty'`, which correctly handles null, absent, and empty-string cases (FR-3, EC-1, EC-2, EC-3, BR-1). The key is never written to the queue.
- **API key transmission is safe.** The key is sent only in the `Authorization: Bearer` header over the curl connection. The spec does not transmit the key in the URL, query string, or request body.
- **Queue file never contains credentials.** The queue stores only `{ queuedAt, payload }` where `payload` is the event body — no auth material.
- **4xx handling prevents credential retry amplification.** A 401 during flush drops the entry rather than re-queuing it indefinitely (FR-7, FR-13, BR-2). This is the correct behavior: a bad credential is not retried in a loop.
- **Corrupted queue is reset, not retained.** FR-12 / BR-6 specify that an unparseable queue is discarded rather than blocking delivery. This prevents a permanently wedged state from a single bad write.
- **flock serializes concurrent writers correctly.** The exclusive flock pattern around the full read-modify-write cycle (FR-11, BR-7) prevents queue corruption from parallel sub-agent calls.
- **Script produces no output.** FR-14 mandates `exec >/dev/null 2>&1` at the top. This ensures the API key and response bodies are never echoed to stdout/stderr, preventing accidental credential exposure in terminal logs or CI output.
- **Server-side API key handling is correct.** `requireApiKey.ts` extracts the Bearer token, performs a constant-time DB lookup (no timing oracle), and does not reflect the key value in any response body. `installId` and `orgId` are resolved exclusively server-side from the key — the request body cannot override them.
- **No TOCTOU on config read.** The config is read once at the top of each invocation via `jq`. There is no check-then-use gap; the value is captured into a shell variable immediately.
- **Unbounded queue growth is an accepted limitation, not a security issue.** The spec explicitly defers max queue depth (Out of Scope). Queue growth can fill disk but cannot expose credentials or corrupt server-side data.
