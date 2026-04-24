# Scenario: Memory entry with no `domain` field is reviewed by security-domain architect

## Type
edge-case

## Priority
high — default-to-security is load-bearing for probe completeness

## Preconditions
- Memory contains `INV-0060` with NO `domain` field (legacy entry, author oversight, or malformed after manual edit)
- A spec in review modifies a file covered by `INV-0060.scope.modules`
- All three domain architects spawn in parallel

## Action
Each domain architect runs the probe. `INV-0060` has no `domain` field.

## Expected Outcome
- Security-domain architect's probe INCLUDES `INV-0060` (default-to-security).
- Architecture-domain architect's probe does NOT include `INV-0060` (no ownership transfer; default is security, not broadcast).
- API-domain architect's probe does NOT include `INV-0060`.
- Security-domain review may emit a SUGGESTION: `"INV-0060 is missing a domain field; author should assign one of security | architecture | api in a future spec."`
- If `INV-0060` is violated by the spec, ONLY the security-domain review emits the BLOCKER. The other two reviewers do not double-count.
- Security-domain reviewer language in the prompt must explicitly state the default-to-security rule — a prompt assertion should verify this.

## Notes
Validates BR-7, FR-6, EC-5. The default-to-security rule prevents an unclassified invariant from being "orphaned" between reviewers (no one checks it).
