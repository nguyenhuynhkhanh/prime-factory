# Scenario: H-22 — Developer edits a candidate's sourceRef to a non-existent path during sign-off

## Type
edge-case

## Priority
low — EC-13. Developer typos or intentional edits are possible.

## Preconditions
- Phase 7 Memory Sign-Off is documented with edit semantics.

## Action
Structural test asserts Phase 7's edit-semantic documentation:
1. After a developer edits a `sourceRef`, the agent verifies the new reference resolves.
2. If it does not resolve, the agent WARNS the developer (not silently proceeds).
3. The developer may confirm anyway (e.g., the file will exist after their next commit, or they intentionally want a symbolic reference) — the edit is accepted after an affirmative second confirmation.
4. The written entry retains the developer's edited reference verbatim (no auto-correction).

## Expected Outcome
- Post-edit verification documented.
- Warning behavior documented.
- Developer override path documented.
- No auto-correction.

## Failure Mode (if applicable)
If the documentation silently accepts any edit, test fails — the developer should at least see a warning for unresolved references.

## Notes
The agent must respect developer authority while also being helpful. A single warning with a confirm path is the right balance.
