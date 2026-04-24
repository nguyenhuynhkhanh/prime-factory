# Scenario: Architect BLOCKS on active invariant violated without explicit Modifies/Supersedes declaration

## Type
edge-case

## Priority
critical — this is the primary enforcement edge of the probe

## Preconditions
- Memory contains `INV-0005` (domain: security, `rule: "all user-scope queries must include tenant_id filter"`, scope.modules: `["src/db/queries/*.js"]`, status: active)
- A spec introduces a new repository function in `src/db/queries/users.js` that queries users WITHOUT tenant_id filter
- The spec does NOT declare `Modifies` or `Supersedes` for INV-0005
- security-domain architect-agent is spawned

## Action
Security-domain architect performs Step 1 Deep Review including the memory probe.

## Expected Outcome
- Security domain review contains under `### Memory Findings (Security)`:
  ```
  Potentially violated (BLOCKER): INV-0005 — new query function in src/db/queries/users.js omits tenant_id filter; no Modifies/Supersedes declaration in spec
  ```
- Review Status: `BLOCKED`
- Architecture and API domain reviewers do NOT restate the INV-0005 violation (BR-3: only the owning domain reports it).
- implementation-agent sees the BLOCKER and respawns spec-agent to either (a) add the tenant_id filter to the plan or (b) add a `Modifies` declaration with rationale.
- If spec-agent respawns with the plan corrected (adds tenant_id filter), round 2 architect probe finds no violation — BLOCKER clears.

## Notes
Validates FR-6, FR-8, BR-2, BR-3. This is the core enforcement path. Without the probe, the violation would ship silently.
