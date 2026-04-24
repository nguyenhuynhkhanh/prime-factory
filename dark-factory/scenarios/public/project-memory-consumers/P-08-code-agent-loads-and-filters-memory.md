# Scenario: code-agent loads memory in Phase 1 and treats overlapping entries as hard constraints

## Type
feature

## Priority
critical — constraint-awareness is the read-side enforcement

## Preconditions
- Memory contains `INV-0011` (domain: security, scope.modules includes `src/auth/tokens.js`, rule: "tokens must be signed with the production secret; never use static strings for JWT secrets")
- A spec (already architect-approved) tasks code-agent with modifying `src/auth/tokens.js`
- code-agent is spawned

## Action
Inspect the code-agent prompt `.claude/agents/code-agent.md` and verify:
1. Phase 1 / General Patterns load step references `dark-factory/memory/invariants.md`, `dark-factory/memory/decisions.md`, `dark-factory/memory/ledger.md`.
2. The constraint-filtering rule is present: entries whose `scope.modules` overlap with files being modified are treated as HARD CONSTRAINTS.
3. The spec is the only authoritative override: code-agent may violate an invariant ONLY IF the spec explicitly declares `Modifies` or `Supersedes` of that entry.

## Expected Outcome
- The code-agent prompt contains a clear passage directing it to load the three memory files alongside profile/code-map.
- The prompt contains a clear passage: "For each memory entry whose `scope.modules` overlaps with files you will modify, treat the entry's `rule` and `rationale` as a HARD CONSTRAINT. Do not violate the rule unless the spec explicitly declares supersession or modification of the entry."
- During implementation, if code-agent is asked to hardcode a JWT secret string into `src/auth/tokens.js`, the code-agent recognizes this violates `INV-0011` and either (a) refuses and reports back to implementation-agent, or (b) uses the production-secret loader.
- EC-9: code-agent does not care that `INV-0011.domain == security` — it treats constraint applicability by scope overlap only, not by domain.

## Notes
Validates FR-10, FR-11, AC-6, AC-7, EC-9. The holdout suite covers adversarial cases where the spec tries to "trick" code-agent into ignoring a constraint (see H-09).
