# Scenario: promote-agent re-reads memory at commit time (not cached from run start)

## Type
concurrency

## Priority
high — robustness to out-of-band edits.

## Preconditions
- promote-agent.md edited.
- Hypothetical: developer manually edits memory between implementation-agent's Step 3 (test passed) and Step 4 (promote).

## Action
Read promote-agent.md's re-read documentation.

## Expected Outcome
- promote-agent.md explicitly documents: "memory is re-read at commit time, not cached from start of run" (or equivalent).
- ID assignment uses the latest on-disk state, not a stale snapshot.
- Adversarial: manual edit adds INV-0007 between start and commit → promote-agent sees INV-0007, assigns INV-0008 (not INV-0007, which would collide).

## Notes
Covers BR-11, EC-8. Subtle concurrency scenario — naive impl might read once at Step 1 and write at Step 7, missing the interleaved edit.
