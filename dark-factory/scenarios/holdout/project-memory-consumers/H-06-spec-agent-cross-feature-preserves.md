# Scenario: spec-agent correctly populates Preserves when the spec's scope overlaps an invariant transitively

## Type
edge-case

## Priority
medium — exercises the scope-overlap logic

## Preconditions
- Memory contains `INV-0040` (scope.modules: `["src/services/billing.js", "src/services/subscription.js"]`, domain: architecture)
- A spec introduces a new endpoint in `src/api/routes/billing.js` that CALLS `src/services/billing.js` (transitive touch, not direct modification)
- spec-agent is drafting the spec

## Action
spec-agent analyzes scope and determines what memory entries to list.

## Expected Outcome
- Direct-overlap case: `src/services/billing.js` is NOT being modified, only called. The invariant's `scope.modules` does NOT include `src/api/routes/billing.js`.
- spec-agent has a CHOICE: list INV-0040 under `References` (acknowledges the invariant is relevant context for callers) or omit (callers are not constrained by the same invariant). The spec-agent prompt should guide the decision:
  - If the new code COULD inadvertently cause the called code to violate its invariant (e.g., by passing bad input), list under `References`.
  - If the new code is purely consumer-side and cannot affect the callee's invariant, omission is acceptable.
- For this scenario (billing endpoint calling billing service), the spec-agent SHOULD list under `References` because billing-service callers can affect subscription-state invariants.
- spec-agent does NOT list under `Preserves` — `Preserves` is for DIRECT scope overlap (the spec modifies a file in `scope.modules`).

## Notes
Validates FR-2. Refines the `Preserves` vs `References` distinction. Holdout because the decision requires judgment — easy to under- or over-list.
