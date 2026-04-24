# Scenario: P-09 — Three-batch developer sign-off with per-entry accept/edit/reject and permanent ID assignment

## Type
feature

## Priority
critical — FR-15, FR-17, BR-6, NFR-4. This is the product invariant: the developer is always the final signer and the agent never writes silently.

## Preconditions
- Phase 7 in onboard-agent.md has been extended with a "Memory Sign-Off" section.

## Action
Structural test extracts Phase 7's Memory Sign-Off subsection and asserts:
1. Three explicit batches are named: invariants, decisions, ledger.
2. Per-entry semantics are documented for invariants and decisions: `accept`, `edit`, `reject`.
3. Bulk actions are available: at least "accept all" (non-low-confidence) and "reject all".
4. Ledger presentation is documented as **read-only** (developer confirms the inferred history or flags missing entries; no per-entry edit required for ledger).
5. Low-confidence candidates default to rejected in the sign-off UX.
6. After sign-off, IDs are assigned: `INV-NNNN`, `DEC-NNNN`, `FEAT-NNNN` starting at `NNNN=0001` (or max-existing+1).
7. File frontmatter on write includes `generatedBy: onboard-agent`, `lastUpdated`, `gitHash`.
8. NO phrase in the sign-off subsection permits silent/automatic writes without the presented batch's sign-off.

## Expected Outcome
- All eight assertions pass.
- Memory files are explicitly the only artifact the Memory Sign-Off step writes.

## Failure Mode (if applicable)
If any assertion fails, test names the missing element.

## Notes
This scenario is the structural counterpart to H-05 (adversarial: what if sign-off is skipped? Must fail.). Together they lock down the no-silent-writes invariant (INV-TBD-a).
