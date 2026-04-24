# Scenario: Invariants TEMPLATE entry carries either enforced_by or enforcement — not neither, not both accidentally

## Type
edge-case

## Priority
critical — BR-4 is the anti-aspiration guardrail. An invariant with no enforcement proof is a wish, not a rule.

## Preconditions
- `dark-factory/memory/invariants.md` exists with a TEMPLATE entry.

## Action
Parse the TEMPLATE entry in `invariants.md`. Extract the fields `enforced_by` and `enforcement`.

## Expected Outcome
- At least one of `enforced_by` or `enforcement` is populated with a meaningful value.
- If `enforced_by` is present, it contains a test file path (e.g., starts with `tests/` or `test/`, ends with `.test.js`, `.test.ts`, `.spec.js`, `.spec.ts`, or similar).
- If `enforcement` is present, its value is exactly one of `runtime` or `manual` (strict enum).
- If both are present, that is acceptable (belt-and-suspenders), but the TEMPLATE entry need not demonstrate both.
- The TEMPLATE entry MUST NOT leave both fields empty / missing / set to `TBD`.

## Notes
Validates FR-11, BR-4. Also validates that the template file documents this constraint (see H-04 for the template-side check).
