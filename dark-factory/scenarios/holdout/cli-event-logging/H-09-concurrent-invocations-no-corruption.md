# H-09: Concurrent Invocations — No Queue Corruption

**Type**: integration
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-11, BR-7, EC-7

---

## Description

Two invocations of `log-event.sh` run simultaneously (simulating df-orchestrate firing architect-agent and code-agent in parallel). Both attempts to queue — the `flock` locking must serialize the writes and both events must appear in the final queue with no corruption or data loss.

---

## Scenario

### Given

- `~/.df-factory/config.json` contains valid `apiKey` and `baseUrl`.
- `~/.df-factory/event-queue.json` does not exist.
- Mock `curl` exits with code 1 (network error) for all calls.

### When

Both scripts are launched in parallel (background processes) and waited for:

```bash
cli-lib/log-event.sh '{"command":"df-orchestrate","startedAt":"2026-04-07T12:00:00Z","subcommand":"architect-agent-spawned","sessionId":"sess-001"}' &
cli-lib/log-event.sh '{"command":"df-orchestrate","startedAt":"2026-04-07T12:00:00Z","subcommand":"code-agent-spawned","sessionId":"sess-001"}' &
wait
```

### Then

- Both background processes exited with code 0.
- `~/.df-factory/event-queue.json` exists and contains valid JSON.
- `jq '.events | length' event-queue.json` returns exactly `2`.
- One entry has `payload.subcommand == "architect-agent-spawned"`.
- One entry has `payload.subcommand == "code-agent-spawned"`.
- No output from either process.

---

## Why This Matters

Without `flock`, a race condition between two concurrent read-modify-write cycles on the queue file will cause one entry to overwrite the other. The final queue would contain only 1 event instead of 2. This is the most realistic production scenario for this script (df-orchestrate spawns 4 agents in parallel).

---

## Implementation Note

In bats, `run` is synchronous. Use subshells with `&` and `wait` directly (outside of `run`). Assert the queue file using `jq` after both complete. This test is inherently timing-sensitive but should be reliable because `flock` provides the ordering guarantee.
