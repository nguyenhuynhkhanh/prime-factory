# Scenario: Only ledger.md missing — consumers still probe invariants and decisions

## Type
edge-case

## Priority
high — targeted-warning differentiation

## Preconditions
- `dark-factory/memory/invariants.md` exists, populated
- `dark-factory/memory/decisions.md` exists, populated
- `dark-factory/memory/ledger.md` does NOT exist (removed manually, or never created)
- A feature pipeline runs

## Action
spec-agent, architect-agent (all three domains), code-agent, and debug-agent each spawn.

## Expected Outcome
- Every consumer logs a targeted warning: `"Memory file missing: dark-factory/memory/ledger.md — treating ledger as empty"`.
- Every consumer still reads `invariants.md` and `decisions.md` fully.
- Architect-agent per-domain probes run against invariants and decisions (normal probe), NOT skipped.
- Architect-agent does NOT emit `Memory probe skipped — registry missing.` (that is only for the fully-missing case).
- Reviews can still BLOCK on invariant/decision violations if any exist.
- No consumer crashes or refuses to run.
- debug-agent cross-reference against invariants still works (ledger is not used for cross-reference).

## Notes
Validates FR-17, EC-2. The three files are independent for consumer purposes. Only the fully-missing-directory case triggers the "probe skipped" behavior.
