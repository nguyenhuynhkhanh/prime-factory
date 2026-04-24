# Scenario: H-18 — project-profile.md exists but has no Architecture section

## Type
edge-case

## Priority
low — EC-9. Possible in hand-edited or partial profiles.

## Preconditions
- Phase 3.7b is present.

## Action
Structural test asserts Phase 3.7b documents the partial-profile case:
1. If `project-profile.md` exists but lacks an "Architecture" or "Tech Stack" section → emit zero decision candidates.
2. The sign-off summary includes a note ("profile has no Architecture section; no decisions extracted"). Not an error.

## Expected Outcome
- Partial-profile fallback documented.
- No decision candidates produced.
- Informational note in sign-off summary.

## Failure Mode (if applicable)
If the documentation would throw an error or prompt the developer to fix the profile, test fails — Phase 3.7b must be strictly read-only against the profile.

## Notes
Onboard-agent writes the profile in Phase 7. In refresh mode, a pre-existing hand-edited profile might have unusual structure. The decision seeder must tolerate this.
