# Scenario: H-21 — Ambiguous git log match: multiple cleanup commits for same feature

## Type
edge-case

## Priority
low — EC-12. Rare but happens when a feature is cleaned up, re-introduced, and cleaned up again.

## Preconditions
- Phase 3.7c is present.

## Action
Structural test asserts Phase 3.7c documents:
1. If `git log --grep='^Cleanup <feature>' -n 5` returns more than one match, the agent selects the MOST RECENT commit (first in output, assuming git log default ordering by committer date descending).
2. The sign-off summary includes a note about the ambiguity ("multiple cleanup commits found for <feature>; using most recent: <sha>") so the developer can audit.
3. The selection is deterministic (same match order given the same repo state).

## Expected Outcome
- Most-recent selection documented.
- Ambiguity note documented.
- Determinism preserved.

## Failure Mode (if applicable)
If the selection rule is undocumented, test fails. If the developer is not informed of the ambiguity, test fails — they may need to disambiguate manually for archival purposes.

## Notes
The ambiguity is common when a feature is rolled back and re-shipped. The most-recent cleanup is almost always the right reference, but the developer deserves to know.
