# Scenario: ledger.md prominently communicates append-only semantics

## Type
edge-case

## Priority
high — ledger is append-only (BR-2). If that constraint is not obvious in the file itself, a future contributor will edit an existing entry and quietly damage the ledger.

## Preconditions
- `dark-factory/memory/ledger.md` exists.

## Action
Read `ledger.md` and inspect the top prose section (before the first `## FEAT-` entry).

## Expected Outcome
- The prose contains explicit language that communicates the append-only rule. Acceptable phrasings include (but are not limited to):
  - "append-only"
  - "never modify existing entries"
  - "do not edit past entries"
  - "entries once written are frozen"
- The language appears near the top of the file (within the first 20 lines) so a reader sees it immediately.
- The language is specific enough that a contributor cannot miss it — NOT buried inside a bullet or comment.

## Notes
Validates FR-5, BR-2. This is a documentation-as-contract test: the rule must be visible, not just implied.
