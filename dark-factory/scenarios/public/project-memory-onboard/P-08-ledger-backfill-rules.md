# Scenario: P-08 — Ledger retro-backfill rules from promoted-tests.json + git log

## Type
feature

## Priority
critical — FR-10, FR-11, FR-12 define the single source of truth for historical feature tracking. Getting this wrong silently loses history.

## Preconditions
- Phase 3.7c is present in the onboard-agent file.

## Action
Structural test extracts the Phase 3.7c body and asserts:
1. It cites `dark-factory/promoted-tests.json` as the primary data source.
2. It documents the candidate shape: `name`, `summary`, `promotedAt`, `promotedTests`, `gitSha`, `introducedInvariants`, `introducedDecisions`.
3. `introducedInvariants` and `introducedDecisions` are documented as empty arrays `[]` for retroactive entries.
4. Git log strategy is documented as read-only (phrase `read-only` or explicit prohibition on `git add/commit/reset/push`).
5. Git log command is bounded (mentions `-n` limit or equivalent bound).
6. Entries missing a locatable cleanup commit set `gitSha: null` and carry an `[UNKNOWN SHA]` tag.
7. Entries are sorted chronologically ascending by `promotedAt`.

## Expected Outcome
- All seven assertions pass.
- The read-only-git constraint is explicit.

## Failure Mode (if applicable)
If any of the seven elements is missing, test names the missing element.

## Notes
The git log command example should be concrete enough for a code-agent to implement without guessing (e.g., `git log --all --grep='^Cleanup <name>' --format='%H|%cI' -n 5`). Fully-specified commands prevent ambiguity.
