# Scenario: df-cleanup memory health check — MALFORMED_MEMORY reports `--rebuild-memory` hint

## Type
edge-case

## Priority
medium — developer-facing recovery path.

## Preconditions
- `dark-factory/memory/invariants.md` has malformed YAML frontmatter (e.g., unterminated string).

## Action
`/df-cleanup` runs.

## Expected Outcome
- Memory Health Check detects the malformation.
- Reports: "MALFORMED_MEMORY: dark-factory/memory/invariants.md"
- Offers hint: "Run `/df-cleanup --rebuild-memory` to rebuild ledger from promoted-tests.json (invariants/decisions cannot be auto-rebuilt — re-run `/df-onboard`)."
- Does NOT auto-fix.
- Does NOT halt cleanup of other issues; reports and continues.

## Notes
Covers FR-28, BR-13. Adversarial — the malformed file must not crash df-cleanup itself.
