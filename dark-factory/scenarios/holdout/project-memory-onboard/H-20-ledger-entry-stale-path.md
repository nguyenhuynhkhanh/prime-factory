# Scenario: H-20 — Ledger entry references a test file that no longer exists

## Type
edge-case

## Priority
medium — EC-11. Tests get moved and renamed; the ledger must not silently drop entries.

## Preconditions
- Phase 3.7c is present.

## Action
Structural test asserts Phase 3.7c documents:
1. If a `promoted-tests.json` entry references a file path that no longer resolves on disk, the ledger candidate IS STILL produced (entry is preserved).
2. The candidate carries a `[STALE PATH]` tag visible in sign-off.
3. The candidate retains the original path in `promotedTests` — the agent does NOT attempt to resolve the new path or auto-repair.
4. The developer may choose during sign-off to edit the path manually, accept as-is (with stale tag in the written file), or note it for a separate cleanup effort.

## Expected Outcome
- Preservation is explicit.
- `[STALE PATH]` tag documented.
- No auto-repair.
- Developer options enumerated.

## Failure Mode (if applicable)
If the documentation would drop the entry silently, test fails — ledger integrity requires preserving historical entries regardless of file existence.

## Notes
`promoted-tests.json` is the source of truth for what was promoted. If a test was promoted and later refactored to a different file, the ledger must retain the fact that SOMETHING was promoted for that feature — even if the path is stale.
