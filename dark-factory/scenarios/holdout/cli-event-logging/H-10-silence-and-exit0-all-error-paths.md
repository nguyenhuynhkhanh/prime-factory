# H-10: Complete Silence and Exit-0 in All Error Paths

**Type**: unit
**Priority**: P0
**Related spec**: `dark-factory/specs/features/cli-event-logging.spec.md`
**Covers**: FR-14, FR-15, BR-8, AC-2, AC-3

---

## Description

A systematic verification that the script produces no output and exits 0 across every known error path. Each sub-scenario is independent.

---

## Scenario H-10a: Config File Contains Invalid JSON

### Given

- `~/.df-factory/config.json` contains: `INVALID`

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- Exit code is 0.
- Stdout is empty.
- Stderr is empty.

---

## Scenario H-10b: curl Exits With Non-Zero and Produces Error Output

### Given

- `~/.df-factory/config.json` is valid.
- Mock `curl` that writes `"curl: (6) Could not resolve host"` to stderr and exits 6.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- Exit code is 0.
- Stdout is empty.
- Stderr is empty (the curl error output must be suppressed by the script).

---

## Scenario H-10c: Queue File Write Fails (Directory Read-Only)

### Given

- `~/.df-factory/config.json` is valid.
- `~/.df-factory/` directory is made read-only: `chmod 555 ~/.df-factory/`.
- Mock `curl` exits with code 1.

### When

```bash
cli-lib/log-event.sh '{"command":"df-intake","startedAt":"2026-04-07T12:00:00Z"}'
```

### Then

- Exit code is 0.
- Stdout is empty.
- Stderr is empty.

### Cleanup

Restore directory permissions: `chmod 755 ~/.df-factory/`.

---

## Scenario H-10d: Script Called With No Arguments

### Given

- `~/.df-factory/config.json` is valid.

### When

```bash
cli-lib/log-event.sh
```
(No payload argument.)

### Then

- Exit code is 0.
- Stdout is empty.
- Stderr is empty.

---

## Why This Matters

Silence is the contract. Any output from this script will appear in the developer's terminal while they are running Claude Code, which is a user-experience violation. `set -euo pipefail` in particular will cause the script to exit 1 on any unset variable or command failure — this test catches any use of that pattern.
