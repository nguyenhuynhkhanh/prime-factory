# Scenario: promote-agent memory write failure mid-sequence → rollback

## Type
failure-recovery

## Priority
high — atomicity of the three-file write.

## Preconditions
- promote-agent.md edited.
- Hypothetical failure injection: invariants.md write succeeds, decisions.md write fails (e.g., permission error).

## Action
promote-agent attempts the memory write.

## Expected Outcome
- promote-agent keeps an in-memory snapshot of all three files' pre-write state.
- invariants.md is restored to its pre-write state on disk.
- decisions.md is NOT partially written.
- ledger.md is NOT written either (write sequence aborts).
- promote-agent reports failure to implementation-agent: "Memory write failed mid-sequence — rolled back. Promotion aborted."
- Manifest stays at `passed` (not `promoted`).
- No partial state on disk.

## Notes
Covers NFR-1, EC-24. Adversarial — naive impl might leave the first file written and the rest stale, producing inconsistent memory state.
