# Scenario: spec-agent references existing invariants in `Preserves` / `References` subsections

## Type
feature

## Priority
high — this is how memory becomes load-bearing on new work

## Preconditions
- Memory registry contains `INV-0007` (domain: security, scope.modules includes `src/auth/session.js`)
- A developer requests a feature that modifies `src/auth/session.js`
- spec-agent is drafting the spec

## Action
spec-agent drafts the spec for the new feature. Its scope includes `src/auth/session.js` — the module covered by `INV-0007.scope.modules`.

## Expected Outcome
- The output spec file `dark-factory/specs/features/{name}.spec.md` contains a `## Invariants` section.
- Under `## Invariants > Preserves`, the entry `INV-0007` is listed by ID with a one-line reason (e.g., "INV-0007 (session-rotation-on-privilege-escalation) — new code does not bypass the rotation step").
- The spec does NOT duplicate the full text of INV-0007 — it references by ID only.
- If the spec ALSO touches the invariant's rule directly (e.g., has to update it), the entry moves to `Modifies` or `Supersedes` instead (see P-04).

## Notes
Validates FR-2 and AC-2 (spec-agent drafting logic). The spec-agent prompt instruction that produces this behavior is asserted separately in setup tests; this scenario describes the end-to-end expectation.
