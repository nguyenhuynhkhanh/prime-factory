# Scenario: H-07 — Refresh: sourceRef file replaced at a different path (moved)

## Type
edge-case

## Priority
medium — EC-14. Common real-world case after refactors.

## Preconditions
- Phase 3.7 incremental-refresh section is documented.

## Action
Structural test asserts the refresh documentation explicitly addresses file relocation:
1. When an existing entry's `sourceRef` file no longer resolves, the agent does NOT attempt auto-discovery of an "equivalent" file at a new path.
2. The developer is presented with two options: edit the `sourceRef` manually OR flip the entry to `retired`.
3. The agent MAY surface a heuristic suggestion (e.g., "a file with the same basename now exists at path Y"), but MUST NOT auto-apply it.

## Expected Outcome
- No auto re-pointing.
- Developer options documented.
- Heuristic suggestion permitted but explicitly labeled as non-automatic.

## Failure Mode (if applicable)
If auto-discovery/auto-repair is documented as the default behavior, test fails. If the developer options are not listed, test names the missing options.

## Notes
Auto-re-pointing is dangerous because filename collision is common (e.g., two files named `user.schema.ts` in different modules). The agent must not guess.
