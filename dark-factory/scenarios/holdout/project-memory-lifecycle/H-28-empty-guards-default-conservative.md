# Scenario: Promoted test with missing/empty Guards annotation → classified conservatively

## Type
edge-case

## Priority
medium — defensive default behavior.

## Preconditions
- A promoted test fails in Step 2.75.
- Its `Guards:` annotation is EMPTY (`// Guards:` with no path) OR absent entirely.

## Action
test-agent classifies.

## Expected Outcome
- Classification rule: empty/missing Guards → zero overlap → class is `pre-existing-regression` (the weakest class).
- Warning emitted: "Guards annotation missing on {path} — classified conservatively as pre-existing."
- implementation-agent does NOT loop back; proceeds with warning.
- Structural test asserts test-agent.md documents this conservative default.

## Notes
Covers EC-9. Adversarial — naive impl might crash or treat empty Guards as "all overlap" (loop back forever) or "no-op" (silently pass). Conservative default is safe.
