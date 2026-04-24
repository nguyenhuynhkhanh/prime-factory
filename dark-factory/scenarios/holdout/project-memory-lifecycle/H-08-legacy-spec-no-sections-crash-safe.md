# Scenario: Legacy spec promotion does not crash even if spec body has unexpected heading structure

## Type
backward-compatibility

## Priority
high — rollout window must not break legacy specs.

## Preconditions
- Spec file exists but has NO `## Invariants` heading, NO `## Decisions` heading, and the body contains unexpected headings (e.g., `## Old Format`, `## Foo Bar`).

## Action
promote-agent runs.

## Expected Outcome
- No crash / no error raised during parsing.
- No attempt to materialize entries.
- Ledger FEAT entry is still appended.
- A non-fatal note is emitted: "Spec {name} has no `## Invariants` / `## Decisions` sections — legacy format."
- All pre-existing functionality (test promotion, cleanup) works unchanged.

## Notes
Adversarial — a strict parser might fail on unexpected headings. Test feeds a spec with weird headings and asserts promotion succeeds with ledger append.
