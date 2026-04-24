# Scenario: P-10 — Greenfield project produces empty memory files with explanatory header comments

## Type
feature

## Priority
high — FR-9, FR-13, BR-9, EC-8. Greenfield is a first-class case; a fresh project must not crash onboard.

## Preconditions
- Phase 3.7 is present in the onboard-agent file.

## Action
Structural test extracts Phase 3.7a, 3.7b, 3.7c bodies and asserts each one documents a greenfield/empty-source fallback:
1. Phase 3.7a: if no schema files, no validation middleware, and no markdown rules are found → emit zero invariant candidates.
2. Phase 3.7b: if `project-profile.md` is absent OR has no Architecture section → emit zero decision candidates.
3. Phase 3.7c: if `promoted-tests.json` is absent OR empty → emit zero ledger candidates.
4. In all three cases, the resulting memory files (written after sign-off) must include a **header comment** explaining that entries will accumulate as features are specced/promoted.

## Expected Outcome
- All four assertions pass.
- The phrase `greenfield` or equivalent ("no existing code", "empty project") appears in each phase's fallback documentation.
- The header comment text is sufficiently distinctive (e.g., "will accumulate as features are specced and promoted" or close equivalent) to be asserted in tests.

## Failure Mode (if applicable)
If any phase lacks a greenfield fallback, test names the missing phase. If the header-comment requirement is not documented, test fails.

## Notes
Greenfield must NEVER cause an error or prompt the developer with misleading questions. It must silently produce empty files with the comment.
