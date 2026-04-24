# Scenario: spec-agent declares new candidates with INV-TBD-* placeholder IDs and required fields

## Type
feature

## Priority
critical — TBD placeholder convention is the handoff contract to promote-agent

## Preconditions
- Memory registry exists (can be empty or populated)
- Developer requests a feature that introduces a new cross-cutting rule (e.g., "all service-to-service calls must include a trace ID header")
- spec-agent is drafting the spec

## Action
spec-agent identifies that the feature introduces a new invariant (the trace-ID rule) and declares it.

## Expected Outcome
- The spec file contains `## Invariants > Introduces` with at least one entry using the form `INV-TBD-a` (not a real sequential ID).
- The declared entry includes ALL required schema fields:
  - `title`
  - `rule`
  - `scope` (with at least `modules` listed)
  - `domain` (one of `security | architecture | api`)
  - `enforced_by: <test-path>` OR `enforcement: runtime|manual`
  - `rationale`
- If multiple candidates are declared, they are lettered sequentially: `INV-TBD-a`, `INV-TBD-b`, `INV-TBD-c`.
- The spec-agent does NOT write to `dark-factory/memory/*`. Only the spec file is modified.
- Plugin mirror parity for spec-agent.md remains satisfied.

## Notes
Validates FR-3, BR-1, BR-6, AC-2, AC-3. The candidate is declared in the spec — promote-agent (separate spec) is responsible for materializing it into a real INV-NNNN at promotion time.
