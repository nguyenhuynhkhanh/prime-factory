# Scenario: H-11 — Incremental refresh: no partial batch writes

## Type
concurrency

## Priority
high — BR-8. Partial writes would leave memory in an inconsistent state.

## Preconditions
- onboard-agent incremental-refresh section present.

## Action
Structural test asserts the refresh section documents:
1. Writes to each memory file occur **after** the entire batch for that file has completed sign-off (no per-entry write).
2. If the developer aborts partway through a batch (e.g., Ctrl-C or explicit cancel), the agent does NOT write any partial batch to disk — the file stays as it was on entry to the session.
3. If the developer completes one batch (e.g., invariants) and aborts another (e.g., ledger), the completed batch IS written — batches are independent commit units.

## Expected Outcome
- Per-batch atomicity is explicit.
- Abort behavior is documented for both mid-batch and inter-batch cases.
- Batches are independent.

## Failure Mode (if applicable)
If the documentation is silent on abort behavior, test fails. If per-entry writes are documented, test flags the atomicity violation.

## Notes
The three memory files are independent, but within a single file (e.g., invariants.md), additions and status flips must be applied as one atomic write after the batch.
