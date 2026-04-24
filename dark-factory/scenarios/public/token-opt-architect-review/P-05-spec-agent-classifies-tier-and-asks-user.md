# Scenario: Spec-agent classifies tier during spec writing and asks user to confirm

## Type
feature

## Priority
high -- tier classification at spec-writing time is the entry point for the entire optimization; incorrect classification here propagates to all downstream stages

## Preconditions
- `spec-agent.md` has been updated with the Complexity Classification step
- `dark-factory/templates/spec-template.md` has been updated with the `Architect Review Tier` field
- Developer has provided a feature description for a spec that touches 2 files, has no migration, no security concerns
- Spec-agent has completed scope discovery and is ready to write the spec

## Action
Spec-agent completes the scope confirmation and begins Phase 4 (Write the Spec). It performs the Complexity Classification step before finalizing the spec.

## Expected Outcome
- Spec-agent evaluates the spec against the classification signal table
- Spec-agent identifies: ≤ 2 files, no migration section, no security/auth domain, no cross-cutting keywords → Tier 1
- Spec-agent presents the tier assessment to the developer with rationale: e.g., "This spec touches 2 files, has no migration section, and no cross-cutting concerns. I'm classifying this as Tier 1 (1 combined architect, 1 round). Does this look right, or would you like to escalate to Tier 2 or 3?"
- If developer confirms: spec is written with `Architect Review Tier: Tier 1` section populated
- If developer defers ("let architect decide"): spec is written with `Architect Review Tier: Unset — architect self-assesses`
- The `Architect Review Tier` section appears in the spec immediately after the `Implementation Size Estimate` section
- The section includes: Tier value, Reason, Agents count, Rounds budget

## Notes
Validates FR-1 (tier field in spec), FR-2 (spec-agent asks user), FR-11 (template field present). The developer confirmation step is required — the spec-agent must not silently classify without presenting the tier to the developer.
