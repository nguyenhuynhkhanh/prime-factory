# Scenario: Modifies preserves ALL prior history entries (append, not overwrite)

## Type
edge-case

## Priority
critical — durable evolution requires history preservation across multiple modifications.

## Preconditions
- INV-0003 already has a `history:` array with two prior modifications (modified by spec-a, then spec-b).
- Current active `rule` is whatever spec-b last wrote.
- spec-c declares `## Invariants > Modifies > INV-0003` with a new `rule`.

## Action
promote-agent processes spec-c.

## Expected Outcome
- `history` now contains THREE entries (preserving spec-a's and spec-b's, PLUS a new entry for spec-c).
- Each history entry has `{ previousValue, modifiedBy, modifiedAt }`.
- The order is preserved (oldest first).
- `rule` is set to spec-c's new value.
- `lastModifiedBy: spec-c`.

## Notes
Adversarial — naive impl might overwrite `history` with a new single-element array. Test asserts N+1 history length after N modifications.
