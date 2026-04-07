# H-08: Missing ~/.df-factory Directory — Auto-Created

**Type**: unit
**Priority**: P1
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-10, AC-9

---

## Description

When `~/.df-factory/` does not exist at all and the script needs to queue an event, the directory is created automatically before the queue file is written.

---

## Scenario

### Given

- A test HOME directory with no `.df-factory/` subdirectory at all.
- `~/.df-factory/config.json` DOES exist (place it directly — create the dir for config setup only, then delete the dir to simulate the missing dir scenario; OR use a separate config path override if the bats test supports it).

  **Practical bats approach**: use `export HOME="$TEST_HOME"`. Create `$TEST_HOME/.df-factory/config.json` with valid credentials. Then remove `$TEST_HOME/.df-factory/` and recreate ONLY `config.json` at the path using `mkdir -p` and direct write — actually, just test that if the dir doesn't exist yet and config is present, directory creation happens.

  **Simplest setup**: Export a temp `HOME`. Write `config.json` at the expected path (creating the dir). Then delete the entire `.df-factory/` dir. Create `config.json` fresh without the parent dir existing first. Actually:

  ```bash
  # In bats setup
  export HOME="$(mktemp -d)"
  mkdir -p "$HOME/.df-factory"
  echo '{"apiKey":"test","baseUrl":"http://localhost"}' > "$HOME/.df-factory/config.json"
  # Now simulate the directory being gone at queue time by:
  # Not pre-creating the directory — just ensure config is there
  # The simplest: write config.json, then delete the whole dir,
  # then put config.json back without recreating the dir:
  # (Use a separate CONFIG_PATH env var if the script supports it, otherwise just test:
  #  when config is present and network fails, directory is created for queue)
  ```

  The simplest correct setup: `HOME` has `.df-factory/config.json`. Delete the dir. The script must recreate it.

- Mock `curl` exits with code 1 (network error).

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- `~/.df-factory/` directory now exists (was created by the script).
- `~/.df-factory/event-queue.json` exists and contains 1 queued event.
- Script exited with code 0. No output.

---

## Why This Matters

A developer who reinstalls or wipes their home directory config may not have the `.df-factory/` directory. The script must not crash trying to write to a non-existent directory.
