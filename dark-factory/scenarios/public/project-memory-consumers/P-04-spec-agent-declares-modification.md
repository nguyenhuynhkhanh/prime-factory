# Scenario: spec-agent declares Modifies with mandatory rationale

## Type
feature

## Priority
high — modifications without rationale are a downstream BLOCKER from architect

## Preconditions
- Memory registry contains `INV-0003` (`title: all-api-responses-wrap-in-envelope`, domain: api)
- Developer requests a feature that narrows INV-0003 — e.g., error responses may now be returned unwrapped for a specific debug endpoint
- spec-agent is drafting the spec

## Action
spec-agent identifies the feature as narrowing an existing invariant and declares a modification (not a full supersession).

## Expected Outcome
- The spec contains `## Invariants > Modifies` with an entry like:
  ```
  INV-0003 (all-api-responses-wrap-in-envelope)
  Modification: Scope narrowed — excludes /debug/* endpoints.
  Rationale: Debug endpoints are internal-only and return raw error structs for legibility during incident response. The envelope guarantee is preserved for all public endpoints. The narrowed scope will be re-verified by the security-domain architect in round 1.
  ```
- The rationale is present and meaningful (more than a single word).
- The spec does NOT use `INV-TBD-a supersedes INV-0003` — this is a modification, not a replacement.
- The spec does NOT write to the memory files.

## Notes
Validates FR-4. Absence of rationale (or one-word rationale) would be a BLOCKER from architect — see H-03 for that case.
