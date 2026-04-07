# Scenario P-02: df-check-onboard.sh passes with valid config

**Spec**: api-key-management-cli  
**Script**: cli-lib/df-check-onboard.sh  
**Covers**: FR-10, FR-11, AC-8, NFR-3, NFR-4

## Preconditions

- `~/.df-factory/config.json` exists and is valid JSON with both required fields:
  ```json
  {
    "apiKey": "sk_live_abc123",
    "baseUrl": "https://prime-factory.example.com"
  }
  ```
- No network is available (to confirm offline-safety)

## Action

Run `bash cli-lib/df-check-onboard.sh`

## Expected Outcome

### Stdout
_(empty — no output)_

### Stderr
_(empty)_

### Exit code
`0`

## Assertions

- No output is printed to stdout or stderr
- Exit code is `0`
- No network connection is attempted (verifiable by running with network offline or by mocking `curl` to fail — the script must not invoke `curl`)
- The check completes in under 1 second (no I/O blocking)

## Notes

This scenario validates that `df-check-onboard.sh` is safe to use as a guard at the top of any CLI script:
```bash
df-check-onboard.sh || exit 1
```
No output on success is the correct contract for such a guard.
