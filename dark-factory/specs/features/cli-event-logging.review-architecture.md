# Architecture & Performance Review — cli-event-logging

## Status: BLOCKED

---

## Blockers (if any)

### B-1: `flock` on the queue file + atomic `mv` produces broken locking after the first write

The spec simultaneously requires two incompatible patterns:

1. **Lock on the queue file itself** (Implementation Notes): `( flock -x 200; <operations> ) 200>>"$QUEUE_FILE"`
2. **Atomic write via `mv`** (Implementation Notes): write to a temp file and `mv` it over `$QUEUE_FILE`

These two patterns interact incorrectly. `flock` locks a **file descriptor** (and therefore a specific inode), not a path. When `mv` atomically replaces `$QUEUE_FILE`, the path now points to a new inode. Subsequent processes open fd-200 on the *new* inode via the path, but any concurrently blocked process already has fd-200 open on the *old* inode and will acquire its own lock on a different inode than incoming processes use. After the first write, two processes can simultaneously hold "exclusive" locks on different inodes of the same path — fully defeating BR-7 / FR-11.

This is exactly the scenario EC-7 tests: two agents at the same millisecond. The test may pass on the first-ever queue write but will silently fail to serialize subsequent concurrent writes, allowing queue corruption.

**Fix required before implementation:** Use a dedicated, never-replaced lock file:

```
LOCK_FILE="$HOME/.df-factory/event-queue.lock"
( flock -x 200; <all operations including mv> ) 200>>"$LOCK_FILE"
```

`$LOCK_FILE` is never atomically replaced, so all processes always lock on the same stable inode. `$QUEUE_FILE` remains the data file replaced atomically by `mv`. The spec must be amended to specify this separate lock file.

---

## Concerns (non-blocking)

### C-1: `flock` silently absent on macOS — locking degrades without error

NFR-2 acknowledges `flock` requires Homebrew's `util-linux` on macOS and is not part of the default install. Because `set -euo pipefail` is intentionally avoided, a missing `flock` command inside the subshell produces a command-not-found error (non-zero exit) that is silently absorbed, and the subshell body continues executing **without the lock**. The script still runs, but the queue is unprotected. Concurrent sub-agents on a macOS machine without `util-linux` will race undetected.

The spec should explicitly specify one of: (a) a pre-flight `command -v flock || { <drop event>; exit 0; }` guard that skips queue operations entirely if `flock` is absent (safe degradation), or (b) a `df-onboard` pre-requisite check that halts onboarding if `flock` is not found.

### C-2: `flock` held across all network I/O — severe lock contention on large queues

The spec's architecture holds the exclusive lock for the entire read → flush loop → current-event send cycle (Implementation Notes places all operations inside the flock subshell). For a 50-event queue (EC-8) with a 5-second curl timeout per event, worst-case lock hold time is **~255 seconds** (50 × 5s flush + 1 × 5s current event). Any concurrent sub-agent that arrives during that window blocks entirely.

The correct pattern is to release the lock between network I/O: lock → read queue snapshot → **unlock** → attempt all network calls → lock → write updated queue → **unlock**. This limits lock-hold time to the two brief file I/O windows regardless of queue depth. The spec should specify this two-phase lock design; the current single-lock-covers-everything guidance will cause unacceptable blocking in the parallel sub-agent scenario BR-7 is meant to address (df-orchestrate spawning architect-agent, code-agent, test-agent simultaneously).

### C-3: `mktemp` temp file location not specified — `mv` may be non-atomic

The spec says "write the updated JSON back atomically using a temp file + `mv`" but does not specify where `mktemp` should place the temp file. The default `mktemp` on many systems writes to `/tmp/`. If `~/.df-factory/` and `/tmp/` reside on different filesystems (common in containerised or NFS-mounted environments), `mv` performs a cross-device copy + unlink, which is **not atomic**. A partial write during the copy window can corrupt the queue.

The spec must specify that the temp file is created in the same directory as the queue file:
```bash
tmp="$(mktemp "$HOME/.df-factory/.queue-tmp.XXXXXXXX")"
```
This guarantees same-filesystem placement and true atomic rename.

### C-4: Sequential per-event queue rebuild compounds performance for large backlogs

The flush loop guidance ("rebuild the queue from the entries that remain") is ambiguous about whether the queue file is rewritten after *each individual event* or *once after the entire loop*. If the implementer rewrites the queue file (mktemp + jq + mv) after every successfully flushed event, a 50-event queue produces 50 disk I/O cycles and 100+ `jq` subprocess invocations. The spec should clarify that the queue is rebuilt **once** at the end of the flush loop from the set of events that failed, not incrementally per event.

### C-5: Bash 3.2 compatibility requires explicit enforcement in the flush loop

NFR-2 correctly prohibits bash 4+ array features (macOS ships bash 3.2). However, the flush loop's suggested implementation ("iterate over queue indices with `jq -c '.events[]'` or by index") requires tracking which events succeeded. Without bash 4 associative arrays, the natural alternative is to use indices with `jq --argjson` and rebuild the array using jq's `reduce` or `map(select(...))`. The spec should note explicitly that **no bash arrays of any kind should be used for tracking flush state** — all state tracking must go through `jq` operations to remain bash 3.2 safe.

### C-6: EC-9 flush-stop vs. flush-continue ambiguity has a material performance impact

EC-9 states "The flush stops (or continues — either is acceptable)" after a 5xx on event 3 of 5. These two strategies have significantly different performance profiles. "Stop on first failure" means events 4 and 5 are never attempted and remain queued — fine. "Continue through all failures" means events 4 and 5 each hit the full 5-second timeout curl call. The spec should settle on one strategy. "Stop on first network/5xx failure" is recommended for performance, as a 5xx typically indicates a transient server outage that makes further attempts in the same flush pass futile.

---

## Approved aspects

- **`exec >/dev/null 2>&1` at script top** is the correct, comprehensive approach to silence output for the entire process tree; all subshells and child processes inherit the redirected descriptors.
- **Avoidance of `set -euo pipefail`** is well-reasoned. The explicit error-handling requirement (FR-15: always exit 0) is incompatible with `set -e`, and the guidance to use conditional checks and `|| true` guards is the right substitute discipline.
- **`cli-lib/` placement at repository root** is consistent with the invocation convention ("called from the repository root") documented in the Script Invocation section and aligns with the existing top-level `app/`, `db/`, `lib/` structure.
- **Tool selection — `curl`, `jq`, `mktemp`, `date`** is appropriate for the task. `curl --silent --output /dev/null --write-out "%{http_code}" --max-time 5` cleanly captures only the HTTP status code without stdout noise.
- **`jq -r '.apiKey // empty'`** is the correct jq idiom to treat both absent keys and `null` values as empty, satisfying EC-1 through EC-3.
- **`date -u +"%Y-%m-%dT%H:%M:%S.000Z"`** produces syntactically valid ISO 8601 UTC on both GNU date (Linux) and BSD date (macOS) without any flag incompatibilities.
- **Flush-before-send ordering (BR-4 / FR-4)** is correctly achievable in bash sequential execution; the design is sound.
- **Queue file schema** (`version`, `events[]`, `queuedAt`, `payload`) is minimal, jq-friendly, and the `version: 1` forward-compatibility hook is appropriate for the stated scaling path.
- **4xx is terminal (BR-2 / FR-7)** — not queued during flush or initial send — is architecturally correct; queuing permanently-invalid events would grow the queue indefinitely with no resolution path.
- **bats-core + `export HOME` isolation** is the standard correct approach for hermetic bash tests; overriding `$HOME` in `setup` ensures the script's `~/.df-factory/` expansion never touches the real user directory.
- **EC-10 (trailing slash normalisation)** is explicitly called out in the spec, which is the right place to surface it before implementation.
- **Unbounded queue growth acknowledged as accepted v1 limitation** with a clear, compatible scaling path (future batch endpoint maps directly to the `events` array format) is sound forward planning.
