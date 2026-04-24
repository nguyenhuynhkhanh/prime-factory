# Scenario: Code-agent follows the spec's supersession, not the old active invariant

## Type
edge-case

## Priority
critical — the supersession override is the authoritative escape valve

## Preconditions
- Memory contains `INV-0050` (active, domain: architecture, `rule: "all cron jobs must run at hourly boundaries"`, scope.modules: `["src/jobs/*.js"]`)
- A spec (architect-approved) declares:
  ```
  ## Invariants > Supersedes
  INV-TBD-a supersedes INV-0050
  Rationale: <detailed, multi-sentence explanation of why sub-hour granularity is now required for billing accuracy, along with the new constraint INV-TBD-a establishes>
  INV-TBD-a: cron jobs must run at 15-minute boundaries
  ```
- code-agent is spawned to implement the spec, tasked with creating `src/jobs/billing-reconcile.js` scheduled for every 15 minutes

## Action
code-agent loads memory, sees `INV-0050` covers `src/jobs/*.js`. But the spec declares supersession.

## Expected Outcome
- code-agent's prompt instructs it: "code-agent treats relevant invariants as HARD CONSTRAINTS — implementation must not violate them unless the spec explicitly declares supersession (in which case the spec's declaration is the authoritative override)."
- code-agent sees the supersession declaration in the spec.
- code-agent implements `src/jobs/billing-reconcile.js` with a 15-minute schedule — respecting INV-TBD-a (new rule), NOT INV-0050 (old rule).
- code-agent does NOT raise an error or block on the conflict; it recognizes the supersession as the authoritative override.
- If the spec did NOT declare supersession but code-agent produced a 15-minute schedule, that would be a violation (caught separately by architect round 1 BLOCKER, see H-01).

## Notes
Validates FR-11, EC-9. This is the positive case — the override works. H-01 is the negative case — missing declaration is BLOCKED.
